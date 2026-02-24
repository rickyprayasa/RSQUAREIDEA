import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface PackageInfo {
    name: string
    version: string
    latest: string
    wanted: string
    type: 'dependencies' | 'devDependencies'
    severity?: 'critical' | 'high' | 'moderate' | 'low'
    vulnerability?: string
    description?: string
}

interface UpdateAnalysis {
    summary: {
        total: number
        critical: number
        high: number
        moderate: number
        low: number
        security: boolean
    }
    packages: PackageInfo[]
    aiRecommendations?: string[]
}

// Helper function to run shell commands safely
async function runCommand(command: string): Promise<string> {
    const { execSync } = require('child_process')
    try {
        return execSync(command, {
            cwd: process.cwd(),
            encoding: 'utf-8',
            stdio: 'pipe',
            timeout: 60000, // 60 seconds timeout
        })
    } catch (error: any) {
        // Return stdout even if command fails (npm outdated returns exit code 1)
        return error.stdout || ''
    }
}

// Parse npm outdated output
function parseOutdated(output: string): PackageInfo[] {
    const lines = output.split('\n').filter((line: string) => line.trim())
    const packages: PackageInfo[] = []

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line || line.startsWith('Package')) continue

        const parts = line.split(/\s+/)
        if (parts.length >= 4) {
            packages.push({
                name: parts[0],
                version: parts[1],
                wanted: parts[2],
                latest: parts[3],
                type: 'dependencies',
            })
        }
    }

    return packages
}

// Parse npm audit output
function parseAudit(auditJson: any): Map<string, any> {
    const vulnerabilities = new Map()

    if (!auditJson.vulnerabilities) {
        return vulnerabilities
    }

    for (const [name, data] of Object.entries(auditJson.vulnerabilities)) {
        const vuln = data as any
        vulnerabilities.set(name, {
            severity: vuln.severity,
            vulnerability: vuln.via?.map((v: any) =>
                typeof v === 'string' ? v : v.title || v.url
            ).join(', ') || 'Unknown vulnerability',
        })
    }

    return vulnerabilities
}

// Get package categories
function categorizePackage(name: string): 'critical' | 'high' | 'moderate' | 'low' {
    const critical = ['next', 'react', 'react-dom']
    const high = ['@supabase', '@tiptap', 'ai', '@ai-sdk', 'openai', 'framer-motion']
    const moderate = ['tailwind', 'eslint', 'typescript', '@types']

    if (critical.some(pkg => name === pkg || name.startsWith(pkg))) return 'critical'
    if (high.some(pkg => name.startsWith(pkg))) return 'high'
    if (moderate.some(pkg => name.startsWith(pkg))) return 'moderate'
    return 'low'
}

// Generate AI recommendations using OpenAI
async function generateAIRecommendations(packages: PackageInfo[]): Promise<string[]> {
    try {
        // Check if OpenAI API key is available
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            return []
        }

        const { OpenAI } = require('openai')
        const openai = new OpenAI({ apiKey })

        const packageList = packages
            .map(p => `- ${p.name}: ${p.version} → ${p.latest}${p.severity ? ` (${p.severity})` : ''}`)
            .join('\n')

        const prompt = `Analyze these npm package updates and provide prioritized recommendations:

${packageList}

Consider:
1. Security implications
2. Breaking changes
3. Dependencies impact
4. Best practices

Provide 3-5 specific recommendations in JSON array format like:
["Recommendation 1", "Recommendation 2", ...]

Be concise and actionable.`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a DevOps expert specializing in npm package management and security. Provide concise, actionable recommendations.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 500,
        })

        const content = response.choices[0]?.message?.content || '[]'
        try {
            return JSON.parse(content)
        } catch {
            // Fallback: extract recommendations from text
            const matches = content.match(/(?:^|\n)\s*\d+\.\s+([^\n]+)/g) || []
            return matches.map((m: string) => m.replace(/(?:^|\n)\s*\d+\.\s+/, '').trim())
        }
    } catch (error) {
        console.error('Error generating AI recommendations:', error)
        return []
    }
}

export async function GET(request: NextRequest) {
    try {
        // Verify admin session
        const session = await getSession()
        if (!session?.role || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check for outdated packages
        console.log('Checking for outdated packages...')
        const outdatedOutput = await runCommand('npm outdated --json')
        console.log('Outdated output received:', outdatedOutput.substring(0, 200))

        let outdatedData: any = {}

        try {
            outdatedData = JSON.parse(outdatedOutput)
        } catch (parseError) {
            console.error('Failed to parse npm outdated output:', parseError)
            // Fallback to text parsing
            const textOutput = await runCommand('npm outdated')
            const packages = parseOutdated(textOutput)
            outdatedData = {}
            packages.forEach(p => {
                outdatedData[p.name] = {
                    current: p.version,
                    wanted: p.wanted,
                    latest: p.latest,
                }
            })
        }

        // Check for vulnerabilities
        console.log('Checking for vulnerabilities...')
        const auditOutput = await runCommand('npm audit --json')
        let auditData: any = {}
        let vulnerabilities = new Map()

        try {
            auditData = JSON.parse(auditOutput)
            vulnerabilities = parseAudit(auditData)
        } catch (auditError) {
            console.error('Failed to parse npm audit output:', auditError)
        }

        // Process packages
        const packages: PackageInfo[] = []
        let criticalCount = 0
        let highCount = 0
        let moderateCount = 0
        let lowCount = 0

        for (const [name, data] of Object.entries(outdatedData)) {
            const pkg = data as any
            const vuln = vulnerabilities.get(name)

            // Determine severity based on vulnerability and package importance
            let severity: 'critical' | 'high' | 'moderate' | 'low' = categorizePackage(name)

            // Override severity if vulnerability exists
            if (vuln?.severity) {
                if (vuln.severity === 'critical') severity = 'critical'
                else if (vuln.severity === 'high' && severity !== 'critical') severity = 'high'
                else if (vuln.severity === 'moderate' && !['critical', 'high'].includes(severity)) severity = 'moderate'
            }

            packages.push({
                name,
                version: pkg.current,
                wanted: pkg.wanted,
                latest: pkg.latest,
                type: 'dependencies',
                severity,
                vulnerability: vuln?.vulnerability,
            })

            // Count by severity
            if (severity === 'critical') criticalCount++
            else if (severity === 'high') highCount++
            else if (severity === 'moderate') moderateCount++
            else lowCount++
        }

        // Sort by severity and name
        packages.sort((a, b) => {
            const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3 }
            const aSeverity = severityOrder[a.severity || 'low']
            const bSeverity = severityOrder[b.severity || 'low']

            if (aSeverity !== bSeverity) {
                return aSeverity - bSeverity
            }
            return a.name.localeCompare(b.name)
        })

        // Generate AI recommendations (only for security updates)
        const securityPackages = packages.filter(p => p.vulnerability)
        const aiRecommendations = securityPackages.length > 0
            ? await generateAIRecommendations(securityPackages)
            : []

        const analysis: UpdateAnalysis = {
            summary: {
                total: packages.length,
                critical: criticalCount,
                high: highCount,
                moderate: moderateCount,
                low: lowCount,
                security: packages.some(p => !!p.vulnerability),
            },
            packages,
            aiRecommendations,
        }

        console.log('Analysis complete:', analysis.summary)
        return NextResponse.json(analysis)
    } catch (error: any) {
        console.error('Error checking updates:', error)
        return NextResponse.json(
            {
                error: 'Failed to check updates',
                message: error.message,
                details: error.stack
            },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

export async function GET(request: NextRequest) {
    try {
        // Verify admin session
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error('Auth error:', authError)
            return NextResponse.json({ error: 'Unauthorized - No user session' }, { status: 401 })
        }

        // Get user profile to check role
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('id, email, name, role')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            console.error('Profile error:', profileError)
            return NextResponse.json({ error: 'Unauthorized - User profile not found' }, { status: 401 })
        }

        if (profile.role !== 'admin' && profile.role !== 'superadmin') {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
        }

        const { execSync } = require('child_process')

        // Check for outdated packages
        let outdatedData: any = {}
        try {
            const outdatedOutput = execSync('npm outdated --json', {
                cwd: process.cwd(),
                encoding: 'utf-8',
                stdio: 'pipe',
                timeout: 60000,
            })
            outdatedData = JSON.parse(outdatedOutput.toString())
        } catch (error: any) {
            // npm outdated returns non-zero exit code when updates exist
            if (error.stdout) {
                try {
                    outdatedData = JSON.parse(error.stdout.toString())
                } catch {
                    outdatedData = {}
                }
            }
        }

        // Check for vulnerabilities
        let vulnerabilities = new Map()
        try {
            const auditOutput = execSync('npm audit --json', {
                cwd: process.cwd(),
                encoding: 'utf-8',
                stdio: 'pipe',
                timeout: 60000,
            })
            const auditData = JSON.parse(auditOutput.toString())

            if (auditData.vulnerabilities) {
                for (const [name, data] of Object.entries(auditData.vulnerabilities)) {
                    const vuln = data as any
                    vulnerabilities.set(name, {
                        severity: vuln.severity,
                        vulnerability: vuln.via?.map((v: any) =>
                            typeof v === 'string' ? v : v.title || v.url
                        ).join(', ') || 'Unknown vulnerability',
                    })
                }
            }
        } catch (auditError) {
            // Ignore audit errors
            console.log('Audit check failed or vulnerabilities found')
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
        }

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

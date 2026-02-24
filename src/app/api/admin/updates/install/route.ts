import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface InstallRequest {
    packages: string[]
    type?: 'dependencies' | 'devDependencies'
}

// Helper function to run shell commands safely
async function runCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    const { execSync } = require('child_process')
    try {
        const stdout = execSync(command, {
            cwd: process.cwd(),
            encoding: 'utf-8',
            stdio: 'pipe',
            timeout: 120000, // 2 minutes timeout for install
        })
        return { stdout, stderr: '' }
    } catch (error: any) {
        return {
            stdout: error.stdout || '',
            stderr: error.stderr || error.message || ''
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        // Verify admin session
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check user role
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json() as InstallRequest
        const { packages, type = 'dependencies' } = body

        if (!packages || packages.length === 0) {
            return NextResponse.json({ error: 'No packages specified' }, { status: 400 })
        }

        // Build install command
        const packageList = packages.map(p => `${p}@latest`).join(' ')
        const command = type === 'devDependencies'
            ? `npm install --save-dev ${packageList}`
            : `npm install ${packageList}`

        // Run installation
        const result = await runCommand(command)

        // Run audit fix if available
        try {
            await runCommand('npm audit fix')
        } catch {
            // Ignore audit fix errors
        }

        return NextResponse.json({
            success: true,
            message: `Successfully installed ${packages.length} package(s)`,
            packages,
            output: result.stdout,
        })
    } catch (error: any) {
        console.error('Error installing packages:', error)
        return NextResponse.json(
            {
                error: 'Failed to install packages',
                message: error.message || error.error || 'Unknown error',
                output: error.stdout || '',
            },
            { status: 500 }
        )
    }
}

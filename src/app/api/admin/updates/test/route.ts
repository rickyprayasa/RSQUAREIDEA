import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

        const { execSync } = require('child_process')

        // Test npm outdated
        let outdatedResult = ''
        try {
            outdatedResult = execSync('npm outdated --json', {
                cwd: process.cwd(),
                encoding: 'utf-8',
                stdio: 'pipe',
            })
        } catch (error: any) {
            outdatedResult = error.stdout || 'Error: ' + error.message
        }

        // Test npm audit
        let auditResult = ''
        try {
            auditResult = execSync('npm audit --json', {
                cwd: process.cwd(),
                encoding: 'utf-8',
                stdio: 'pipe',
            })
        } catch (error: any) {
            auditResult = error.stdout || 'Error: ' + error.message
        }

        return NextResponse.json({
            success: true,
            workingDir: process.cwd(),
            outdated: {
                raw: outdatedResult,
                parsed: JSON.parse(outdatedResult || '{}')
            },
            audit: {
                raw: auditResult.substring(0, 500), // Truncate for readability
                parsed: JSON.parse(auditResult || '{"vulnerabilities": {}}')
            }
        })
    } catch (error: any) {
        return NextResponse.json(
            {
                error: error.message,
                stack: error.stack,
                cwd: process.cwd()
            },
            { status: 500 }
        )
    }
}

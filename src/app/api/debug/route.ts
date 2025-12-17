import { NextRequest, NextResponse } from 'next/server'

// Debug endpoint untuk memeriksa status server dan header
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('debug');

    if (action === 'headers') {
        // Kembalikan semua header yang diterima
        const headers = Object.fromEntries(request.headers.entries());
        return NextResponse.json({ 
            message: 'Request headers received',
            headers,
            url: request.url,
            method: request.method
        }, { 
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } else if (action === 'redirect-test') {
        // Endpoint ini tidak boleh redirect - kembalikan JSON langsung
        return NextResponse.json({
            status: 'OK',
            message: 'This endpoint should not redirect',
            timestamp: new Date().toISOString(),
            url: request.url
        }, { 
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } else {
        return NextResponse.json({
            status: 'Debug endpoint active',
            availableActions: [
                '/api/debug/headers - to view request headers',
                '/api/debug/redirect-test - to test for redirects',
            ],
            timestamp: new Date().toISOString()
        });
    }
}
import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

// QRIS EMV Format Generator
// This generates a dynamic QRIS code with amount embedded

import { generateDynamicQRIS } from '@/lib/qris-utils'

export async function POST(request: NextRequest) {
    try {
        const { staticQRIS, amount } = await request.json()
        
        if (!staticQRIS) {
            return NextResponse.json({ error: 'Static QRIS data required' }, { status: 400 })
        }
        
        // If no amount or amount is 0, return the static QRIS as is
        let qrisString: string
        if (!amount || amount <= 0) {
            qrisString = staticQRIS
        } else {
            // Generate dynamic QRIS with amount
            qrisString = generateDynamicQRIS(staticQRIS, amount)
        }
        
        // Generate QR Code as data URL
        const qrDataUrl = await QRCode.toDataURL(qrisString, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
        })
        
        return NextResponse.json({ 
            qrCode: qrDataUrl,
            qrisString,
            amount
        })
    } catch (error) {
        console.error('Error generating QRIS:', error)
        return NextResponse.json({ error: 'Failed to generate QRIS' }, { status: 500 })
    }
}

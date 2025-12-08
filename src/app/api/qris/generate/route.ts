import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

// QRIS EMV Format Generator
// This generates a dynamic QRIS code with amount embedded

function calculateCRC16(str: string): string {
    let crc = 0xFFFF
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021
            } else {
                crc <<= 1
            }
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0')
}

function tlv(tag: string, value: string): string {
    const length = value.length.toString().padStart(2, '0')
    return tag + length + value
}

function parseQRISStatic(qrisString: string): Record<string, string> {
    const data: Record<string, string> = {}
    let i = 0
    
    while (i < qrisString.length) {
        const tag = qrisString.substring(i, i + 2)
        const length = parseInt(qrisString.substring(i + 2, i + 4), 10)
        const value = qrisString.substring(i + 4, i + 4 + length)
        data[tag] = value
        i += 4 + length
    }
    
    return data
}

function generateDynamicQRIS(staticQRIS: string, amount: number): string {
    // Parse the static QRIS
    const parsed = parseQRISStatic(staticQRIS)
    
    // Build dynamic QRIS
    let qris = ''
    
    // 00 - Payload Format Indicator
    qris += tlv('00', '01')
    
    // 01 - Point of Initiation Method (12 = Dynamic)
    qris += tlv('01', '12')
    
    // Copy merchant account info from static QRIS (tags 26-51)
    for (let tag = 26; tag <= 51; tag++) {
        const tagStr = tag.toString().padStart(2, '0')
        if (parsed[tagStr]) {
            qris += tlv(tagStr, parsed[tagStr])
        }
    }
    
    // 52 - Merchant Category Code
    if (parsed['52']) {
        qris += tlv('52', parsed['52'])
    }
    
    // 53 - Transaction Currency (360 = IDR)
    qris += tlv('53', '360')
    
    // 54 - Transaction Amount
    if (amount > 0) {
        qris += tlv('54', amount.toString())
    }
    
    // 55 - Tip or Convenience Indicator (not used for fixed amount)
    
    // 58 - Country Code
    qris += tlv('58', 'ID')
    
    // 59 - Merchant Name
    if (parsed['59']) {
        qris += tlv('59', parsed['59'])
    }
    
    // 60 - Merchant City
    if (parsed['60']) {
        qris += tlv('60', parsed['60'])
    }
    
    // 61 - Postal Code (optional)
    if (parsed['61']) {
        qris += tlv('61', parsed['61'])
    }
    
    // 62 - Additional Data Field (optional)
    if (parsed['62']) {
        qris += tlv('62', parsed['62'])
    }
    
    // 63 - CRC (must be last, calculated over all previous fields)
    qris += '6304'
    const crc = calculateCRC16(qris)
    qris = qris.slice(0, -4) + tlv('63', crc)
    
    return qris
}

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

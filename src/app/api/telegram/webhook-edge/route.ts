export const config = {
  runtime: 'edge',
};

import { NextRequest, NextResponse } from 'next/server';

// Fungsi untuk menangani permintaan webhook Telegram
async function handleTelegramWebhook(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Only POST method allowed' }, { status: 405 });
  }

  try {
    console.log('Edge webhook function called');
    console.log('Request URL:', request.url);
    
    const update = await request.json();
    console.log('Received update:', JSON.stringify(update, null, 2));

    // Hanya kembalikan respons sukses untuk menghindari redirect
    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error in edge webhook:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Tangani permintaan POST
export async function POST(request: NextRequest) {
  return handleTelegramWebhook(request);
}

// Tangani permintaan GET untuk debugging
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'Edge webhook endpoint is active',
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method
  });
}

// Tangani permintaan OPTIONS untuk CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
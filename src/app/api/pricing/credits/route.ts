// src/app/api/pricing/credits/route.ts - Credit package purchase API

import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth-middleware'
import { PRICING } from '@/lib/pricing'

export const runtime = 'edge'

/**
 * GET /api/pricing/credits - Get available credit packages
 */
export async function GET() {
  return NextResponse.json({
    packages: PRICING.creditPackages,
  })
}

/**
 * POST /api/pricing/credits - Create credit purchase order
 */
export async function POST(request: NextRequest) {
  const context = getAuthContext(request)
  if (!context) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { packageId, paymentMethod } = body

    if (!packageId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing packageId or paymentMethod' },
        { status: 400 }
      )
    }

    if (!['alipay', 'wechat'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    const pkg = PRICING.creditPackages[packageId]
    if (!pkg) {
      return NextResponse.json(
        { error: 'Invalid package' },
        { status: 400 }
      )
    }

    // In real implementation:
    // 1. Create transaction record in database
    // 2. Call payment gateway (Alipay/WeChat)
    // 3. Return payment URL or QR code

    // Mock response
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      orderId,
      credits: pkg.credits,
      price: pkg.price,
      paymentMethod,
      paymentUrl: `https://payment.example.com/pay/${orderId}`,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(orderId)}`,
    })
  } catch (error) {
    console.error('Credit purchase error:', error)
    return NextResponse.json(
      { error: 'Failed to create purchase order' },
      { status: 500 }
    )
  }
}

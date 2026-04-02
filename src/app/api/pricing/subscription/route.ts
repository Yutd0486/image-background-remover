// src/app/api/pricing/subscription/route.ts - Subscription management API

import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth-middleware'
import { PRICING } from '@/lib/pricing'

export const runtime = 'edge'

/**
 * GET /api/pricing/subscription - Get current subscription
 */
export async function GET(request: NextRequest) {
  const context = getAuthContext(request)
  if (!context) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // In real implementation, fetch from database
  return NextResponse.json({
    plan: context.plan,
    monthlyLimit: context.monthlyLimit,
    monthlyUsage: context.monthlyUsage,
    credits: context.credits,
    status: 'active',
  })
}

/**
 * POST /api/pricing/subscription - Create or upgrade subscription
 */
export async function POST(request: NextRequest) {
  const context = getAuthContext(request)
  if (!context) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { plan, billingCycle, paymentMethod } = body

    if (!['pro', 'pro_plus'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      )
    }

    if (!['alipay', 'wechat'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    const pricing = PRICING.subscriptions[plan as 'pro' | 'pro_plus']
    const amount =
      billingCycle === 'monthly' ? pricing.monthlyPrice : pricing.yearlyPrice

    // In real implementation:
    // 1. Create subscription record in database
    // 2. Call payment gateway
    // 3. Return payment URL or QR code

    const orderId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      orderId,
      plan,
      billingCycle,
      amount,
      paymentMethod,
      trialDays: 7,
      paymentUrl: `https://payment.example.com/pay/${orderId}`,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(orderId)}`,
    })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/pricing/subscription - Cancel subscription
 */
export async function DELETE(request: NextRequest) {
  const context = getAuthContext(request)
  if (!context) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // In real implementation:
  // 1. Update subscription status to 'cancelled' in database
  // 2. Set cancellation date
  // 3. Keep access until renewal date

  return NextResponse.json({
    message: 'Subscription cancelled',
    accessUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  })
}

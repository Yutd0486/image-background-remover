// src/lib/auth-middleware.ts - Permission checking middleware

import { NextRequest, NextResponse } from 'next/server'

export interface AuthContext {
  userId: string
  email: string
  plan: 'free' | 'pro' | 'pro_plus'
  credits: number
  monthlyUsage: number
  monthlyLimit: number
}

/**
 * Extract auth context from request
 */
export function getAuthContext(request: NextRequest): AuthContext | null {
  const cookie = request.cookies.get('auth')
  if (!cookie) return null

  try {
    const decoded = atob(cookie.value)
    const bytes = new Uint8Array(decoded.length)
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i)
    }
    const sessionJson = new TextDecoder().decode(bytes)
    const session = JSON.parse(sessionJson)

    // In real implementation, fetch user data from database
    // For now, return mock data
    return {
      userId: session.email,
      email: session.email,
      plan: 'free',
      credits: 3,
      monthlyUsage: 0,
      monthlyLimit: 0,
    }
  } catch {
    return null
  }
}

/**
 * Check if user has enough quota to use a feature
 */
export function checkQuota(
  context: AuthContext | null,
  creditsNeeded: number = 1
): { allowed: boolean; reason?: string } {
  if (!context) {
    return { allowed: false, reason: 'Not authenticated' }
  }

  // Check subscription limit first
  if (context.monthlyLimit > 0) {
    const remainingThisMonth = context.monthlyLimit - context.monthlyUsage
    if (remainingThisMonth > 0) {
      return { allowed: true }
    }
  }

  // Check credits
  if (context.credits >= creditsNeeded) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'Insufficient quota. Please purchase credits or upgrade to a subscription.',
  }
}

/**
 * Check if user can use a specific feature
 */
export function checkFeature(
  context: AuthContext | null,
  feature: 'customBackgroundColor' | 'batchProcessing' | 'psdExport' | 'apiAccess' | '4k' | '8k'
): { allowed: boolean; reason?: string } {
  if (!context) {
    return { allowed: false, reason: 'Not authenticated' }
  }

  const featureMap: Record<string, 'free' | 'pro' | 'pro_plus'> = {
    customBackgroundColor: 'pro',
    batchProcessing: 'pro',
    psdExport: 'pro',
    apiAccess: 'pro',
    '4k': 'pro',
    '8k': 'pro_plus',
  }

  const requiredPlan = featureMap[feature]
  const planHierarchy = { free: 0, pro: 1, pro_plus: 2 }

  if (planHierarchy[context.plan] >= planHierarchy[requiredPlan]) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: `This feature requires ${requiredPlan} plan or higher.`,
  }
}

/**
 * Middleware to check quota before processing
 */
export function withQuotaCheck(
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const context = getAuthContext(req)
    const quota = checkQuota(context)

    if (!quota.allowed) {
      return NextResponse.json(
        { error: quota.reason || 'Quota exceeded' },
        { status: 403 }
      )
    }

    return handler(req, context!)
  }
}

/**
 * Middleware to check feature access
 */
export function withFeatureCheck(
  feature: 'customBackgroundColor' | 'batchProcessing' | 'psdExport' | 'apiAccess' | '4k' | '8k',
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const context = getAuthContext(req)
    const featureCheck = checkFeature(context, feature)

    if (!featureCheck.allowed) {
      return NextResponse.json(
        { error: featureCheck.reason || 'Feature not available' },
        { status: 403 }
      )
    }

    return handler(req, context!)
  }
}

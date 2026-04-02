// src/lib/pricing.ts - Pricing and permission utilities

export type UserPlan = 'free' | 'pro' | 'pro_plus'

export interface UserQuota {
  plan: UserPlan
  credits: number
  monthlyLimit: number
  monthlyUsage: number
  canUse: boolean
  remainingThisMonth: number
}

export const PRICING = {
  creditPackages: [
    { credits: 10, price: 15.00, discount: 0 },
    { credits: 50, price: 70.00, discount: 7 },
    { credits: 100, price: 130.00, discount: 13 },
    { credits: 500, price: 600.00, discount: 20 },
  ],
  subscriptions: {
    pro: {
      monthlyLimit: 100,
      monthlyPrice: 29,
      yearlyPrice: 290,
      yearlyDiscount: 58,
    },
    pro_plus: {
      monthlyLimit: 300,
      monthlyPrice: 79,
      yearlyPrice: 790,
      yearlyDiscount: 158,
    },
  },
  features: {
    free: {
      maxResolution: '2K',
      customBackgroundColor: false,
      batchProcessing: false,
      historyRetention: 7,
      psdExport: false,
      apiAccess: false,
      priorityQueue: false,
    },
    pro: {
      maxResolution: '4K',
      customBackgroundColor: true,
      batchProcessing: true,
      batchSize: 10,
      historyRetention: 90,
      psdExport: true,
      apiAccess: true,
      priorityQueue: true,
    },
    pro_plus: {
      maxResolution: '8K',
      customBackgroundColor: true,
      batchProcessing: true,
      batchSize: 50,
      historyRetention: 180,
      psdExport: true,
      apiAccess: true,
      priorityQueue: true,
      priorityLevel: 'highest',
    },
  },
}

/**
 * Calculate user's current quota
 */
export function calculateUserQuota(
  plan: UserPlan,
  credits: number,
  monthlyUsage: number,
  subscription?: { monthlyLimit: number; status: string }
): UserQuota {
  let monthlyLimit = 0
  
  if (plan === 'pro' && subscription?.status === 'active') {
    monthlyLimit = PRICING.subscriptions.pro.monthlyLimit
  } else if (plan === 'pro_plus' && subscription?.status === 'active') {
    monthlyLimit = PRICING.subscriptions.pro_plus.monthlyLimit
  }

  const remainingThisMonth = monthlyLimit - monthlyUsage
  const canUse = credits > 0 || remainingThisMonth > 0

  return {
    plan,
    credits,
    monthlyLimit,
    monthlyUsage,
    canUse,
    remainingThisMonth,
  }
}

/**
 * Check if user can perform action based on plan
 */
export function canUseFeature(
  plan: UserPlan,
  feature: keyof typeof PRICING.features.free
): boolean {
  const features = PRICING.features[plan]
  return (features as any)[feature] ?? false
}

/**
 * Get recommended plan based on monthly usage
 */
export function getRecommendedPlan(monthlyUsage: number): UserPlan {
  if (monthlyUsage <= 30) {
    return 'pro'
  } else if (monthlyUsage <= 300) {
    return 'pro_plus'
  }
  return 'pro_plus'
}

/**
 * Calculate savings for subscription vs credit package
 */
export function calculateSavings(
  monthlyUsage: number,
  plan: 'pro' | 'pro_plus'
): { creditCost: number; subscriptionCost: number; savings: number } {
  const creditPrice = 1.4 // Average credit price
  const creditCost = monthlyUsage * creditPrice

  const subscriptionCost =
    plan === 'pro'
      ? PRICING.subscriptions.pro.monthlyPrice
      : PRICING.subscriptions.pro_plus.monthlyPrice

  const savings = Math.max(0, creditCost - subscriptionCost)

  return {
    creditCost: Math.round(creditCost * 100) / 100,
    subscriptionCost,
    savings: Math.round(savings * 100) / 100,
  }
}

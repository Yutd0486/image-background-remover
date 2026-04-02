'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface UserSubscription {
  plan: 'free' | 'pro' | 'pro_plus'
  monthlyLimit: number
  monthlyUsage: number
  credits: number
  status: string
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/pricing/subscription')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const planNames = {
    free: '免费版',
    pro: 'Pro',
    pro_plus: 'Pro Plus',
  }

  const planColors = {
    free: 'gray',
    pro: 'blue',
    pro_plus: 'purple',
  }

  const color = planColors[subscription?.plan || 'free']
  const colorClass = {
    gray: 'bg-gray-100 text-gray-900 border-gray-300',
    blue: 'bg-blue-100 text-blue-900 border-blue-300',
    purple: 'bg-purple-100 text-purple-900 border-purple-300',
  }[color]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">订阅管理</h1>
          <p className="text-gray-600">管理你的订阅和积分</p>
        </div>

        {/* Current Plan */}
        <div className={`rounded-2xl shadow-lg p-8 mb-8 border-2 ${colorClass}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">当前方案</p>
              <h2 className="text-3xl font-bold">
                {planNames[subscription?.plan || 'free']}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">状态</p>
              <p className="text-lg font-medium text-green-600">
                {subscription?.status === 'active' ? '活跃' : '已取消'}
              </p>
            </div>
          </div>

          {subscription?.plan !== 'free' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white bg-opacity-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">本月使用</p>
                <p className="text-2xl font-bold">
                  {subscription?.monthlyUsage}/{subscription?.monthlyLimit}
                </p>
              </div>
              <div className="bg-white bg-opacity-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">剩余次数</p>
                <p className="text-2xl font-bold">
                  {(subscription?.monthlyLimit || 0) - (subscription?.monthlyUsage || 0)}
                </p>
              </div>
            </div>
          )}

          {subscription?.plan === 'free' && (
            <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">可用积分</p>
              <p className="text-2xl font-bold">{subscription?.credits}</p>
            </div>
          )}

          <div className="flex gap-4">
            {subscription?.plan !== 'free' && (
              <>
                <Link
                  href="/pricing"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors text-center"
                >
                  升级方案
                </Link>
                <button className="flex-1 border-2 border-current hover:bg-white hover:bg-opacity-20 font-medium py-3 rounded-lg transition-colors">
                  取消订阅
                </button>
              </>
            )}
            {subscription?.plan === 'free' && (
              <>
                <Link
                  href="/pricing"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors text-center"
                >
                  购买积分
                </Link>
                <Link
                  href="/pricing"
                  className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-lg transition-colors text-center"
                >
                  升级到 Pro
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Usage Chart */}
        {subscription?.plan !== 'free' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">本月使用情况</h3>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">使用进度</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round(
                    ((subscription?.monthlyUsage || 0) /
                      (subscription?.monthlyLimit || 1)) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      ((subscription?.monthlyUsage || 0) /
                        (subscription?.monthlyLimit || 1)) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Billing History */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">账单历史</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Pro 月度订阅</p>
                <p className="text-sm text-gray-600">2026-04-01</p>
              </div>
              <p className="font-medium text-gray-900">¥29.00</p>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">积分包 (100 积分)</p>
                <p className="text-sm text-gray-600">2026-03-15</p>
              </div>
              <p className="font-medium text-gray-900">¥130.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

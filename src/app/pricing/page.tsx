'use client'

import { useState } from 'react'
import { PRICING } from '@/lib/pricing'

export default function PricingPage() {
  const [selectedTab, setSelectedTab] = useState<'credits' | 'subscription'>('subscription')
  const [monthlyUsage, setMonthlyUsage] = useState(50)

  const calculateCost = (usage: number) => {
    const creditPrice = 1.4
    const creditCost = usage * creditPrice
    const proCost = 29
    const proPlusCost = 79

    return {
      creditCost: Math.round(creditCost * 100) / 100,
      proCost,
      proPlusCost,
      proSavings: Math.max(0, creditCost - proCost),
      proPlusSavings: Math.max(0, creditCost - proPlusCost),
    }
  }

  const costs = calculateCost(monthlyUsage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            选择适合你的方案
          </h1>
          <p className="text-xl text-gray-600">
            灵活的定价，满足所有需求
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setSelectedTab('subscription')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedTab === 'subscription'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            月度订阅
          </button>
          <button
            onClick={() => setSelectedTab('credits')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedTab === 'credits'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            积分包
          </button>
        </div>

        {/* Subscription Plans */}
        {selectedTab === 'subscription' && (
          <div>
            {/* Cost Calculator */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                成本对比计算器
              </h2>
              <div className="flex items-center gap-4 mb-6">
                <label className="text-lg font-medium text-gray-700">
                  预计月使用次数：
                </label>
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={monthlyUsage}
                  onChange={(e) => setMonthlyUsage(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-2xl font-bold text-blue-600 min-w-[60px]">
                  {monthlyUsage}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">积分包成本</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ¥{costs.creditCost}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {monthlyUsage} × ¥1.40/次
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Pro 成本</p>
                  <p className="text-3xl font-bold text-blue-600">¥{costs.proCost}</p>
                  <p className="text-sm text-green-600 font-medium mt-2">
                    节省 ¥{costs.proSavings}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Pro Plus 成本</p>
                  <p className="text-3xl font-bold text-purple-600">
                    ¥{costs.proPlusCost}
                  </p>
                  <p className="text-sm text-green-600 font-medium mt-2">
                    节省 ¥{costs.proPlusSavings}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Pro Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                  <p className="text-blue-100">最受欢迎</p>
                </div>
                <div className="p-8">
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-gray-900">¥29</p>
                    <p className="text-gray-600">/月</p>
                    <p className="text-sm text-gray-500 mt-2">
                      ¥290/年 (省 ¥58)
                    </p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      '100 次/月',
                      '4K 分辨率',
                      '自定义背景色',
                      '批量处理 (10张)',
                      '90 天历史保留',
                      'PSD 导出',
                      'API 访问',
                      '邮件支持',
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors mb-3">
                    立即升级
                  </button>
                  <button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-lg transition-colors">
                    7 天免费试用
                  </button>
                </div>
              </div>

              {/* Pro Plus Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro Plus</h3>
                  <p className="text-purple-100">为重度用户设计</p>
                </div>
                <div className="p-8">
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-gray-900">¥79</p>
                    <p className="text-gray-600">/月</p>
                    <p className="text-sm text-gray-500 mt-2">
                      ¥790/年 (省 ¥158)
                    </p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      '300 次/月',
                      '8K 分辨率',
                      '自定义背景色',
                      '批量处理 (50张)',
                      '180 天历史保留',
                      'PSD 导出',
                      'API 访问',
                      '专属邮件支持',
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors mb-3">
                    立即升级
                  </button>
                  <button className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-medium py-3 rounded-lg transition-colors">
                    7 天免费试用
                  </button>
                </div>
              </div>

              {/* Free Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-gray-600 to-gray-500 px-6 py-8">
                  <h3 className="text-2xl font-bold text-white mb-2">免费版</h3>
                  <p className="text-gray-100">开始使用</p>
                </div>
                <div className="p-8">
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-gray-900">¥0</p>
                    <p className="text-gray-600">/月</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      '3 次 (注册赠送)',
                      '2K 分辨率',
                      '基础背景色',
                      '无批量处理',
                      '7 天历史保留',
                      '无 PSD 导出',
                      '无 API 访问',
                      '社区支持',
                    ].map((feature, idx) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-gray-500"
                      >
                        <span>{idx < 3 ? '✓' : '✗'}</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors">
                    开始免费使用
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Credit Packages */}
        {selectedTab === 'credits' && (
          <div>
            <div className="grid md:grid-cols-4 gap-6">
              {PRICING.creditPackages.map((pkg, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"
                >
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-gray-900">
                      {pkg.credits}
                    </p>
                    <p className="text-gray-600">积分</p>
                  </div>

                  <div className="mb-6">
                    <p className="text-3xl font-bold text-blue-600">
                      ¥{pkg.price}
                    </p>
                    {pkg.discount > 0 && (
                      <p className="text-sm text-green-600 font-medium">
                        省 {pkg.discount}%
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span>✓</span>
                      <span>¥{(pkg.price / pkg.credits).toFixed(2)}/次</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✓</span>
                      <span>365 天有效期</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✓</span>
                      <span>2K 分辨率</span>
                    </li>
                  </ul>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors">
                    购买
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

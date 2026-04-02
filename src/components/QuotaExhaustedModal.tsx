// src/components/QuotaExhaustedModal.tsx - Modal shown when user runs out of quota

'use client'

import { useState } from 'react'
import Link from 'next/link'

interface QuotaExhaustedModalProps {
  isOpen: boolean
  onClose: () => void
  monthlyUsage?: number
}

export default function QuotaExhaustedModal({
  isOpen,
  onClose,
  monthlyUsage = 0,
}: QuotaExhaustedModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            额度已用尽
          </h2>
          <p className="text-gray-600">
            您已用完本月的免费额度，请选择以下方案继续使用
          </p>
        </div>

        {monthlyUsage > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">上月使用情况</p>
            <p className="text-2xl font-bold text-blue-600">{monthlyUsage} 次</p>
            <p className="text-xs text-gray-500 mt-2">
              推荐升级到 Pro 方案，可节省 ¥
              {Math.round((monthlyUsage * 1.4 - 29) * 100) / 100}
            </p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <Link
            href="/pricing?tab=credits"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors text-center"
            onClick={onClose}
          >
            购买积分包
          </Link>
          <Link
            href="/pricing?tab=subscription"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors text-center"
            onClick={onClose}
          >
            升级到 Pro
          </Link>
          <button
            onClick={onClose}
            className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Pro 方案享受 7 天免费试用，无需绑定支付方式
        </p>
      </div>
    </div>
  )
}

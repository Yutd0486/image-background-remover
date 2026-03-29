'use client'

import { useState, useEffect } from 'react'

interface UserStatsProps {
  className?: string
}

export default function UserStats({ className = '' }: UserStatsProps) {
  const [stats, setStats] = useState({
    imagesProcessed: 0,
    totalSaves: 0,
    joinDate: new Date(),
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟加载统计数据
    const timer = setTimeout(() => {
      setStats({
        imagesProcessed: Math.floor(Math.random() * 100) + 10,
        totalSaves: Math.floor(Math.random() * 50) + 5,
        joinDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      })
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statsData = [
    {
      label: '处理图片',
      value: stats.imagesProcessed,
      icon: '🖼️',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: '保存次数',
      value: stats.totalSaves,
      icon: '💾',
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: '加入天数',
      value: Math.floor((Date.now() - stats.joinDate.getTime()) / (1000 * 60 * 60 * 24)),
      icon: '📅',
      color: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

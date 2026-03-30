'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  email?: string
  name?: string
  picture?: string
  loginMethod?: string
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    fetch('/api/auth', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Not authenticated')
      })
      .then(data => {
        setIsAuthenticated(true)
        setUser(data.user || null)
      })
      .catch(() => {
        setIsAuthenticated(false)
        setUser(null)
      })
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE', credentials: 'include' })
    window.location.href = '/login'
  }

  return (
    <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
            <span className="text-white text-lg">✂️</span>
          </div>
          <span className="font-extrabold text-xl">BG Remover</span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <>
              {user?.picture && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.picture} alt={user.name || 'User'} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
              )}
              <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                {user?.name || 'Profile'}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <Link href="/login" className="text-sm font-medium text-purple-600 hover:text-purple-700">
              Sign In
            </Link>
          )}
          <div className="text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full">
            Powered by AI
          </div>
        </div>
      </div>
    </header>
  )
}

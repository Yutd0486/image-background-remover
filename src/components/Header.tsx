'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [loggingOut, setLoggingOut] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    fetch('/api/auth')
      .then(res => setIsAuthenticated(res.ok))
      .catch(() => setIsAuthenticated(false))
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
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
              <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                {loggingOut ? '...' : 'Logout'}
              </button>
            </>
          )}
          <div className="text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full">
            Powered by AI
          </div>
        </div>
      </div>
    </header>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password }),
      })

      if (res.ok) {
        window.location.href = '/'
      } else {
        setError('Incorrect password')
      }
    } catch {
      setError('Error logging in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl">✂️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BG Remover</h1>
            <p className="text-gray-500 text-sm mt-1">Remove backgrounds in seconds</p>
          </div>

          {/* Google Sign In */}
          <a
            href="/api/auth/google"
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg mb-4 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Password Form */}
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? 'Loading...' : 'Continue'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
            Powered by AI
          </div>
        </div>
      </div>
    </div>
  )
}

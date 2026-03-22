'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
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

          {/* Form */}
          <form onSubmit={handleSubmit}>
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

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const ADMIN_PASSWORD = 'bgremover2024'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if already logged in
    const auth = localStorage.getItem('auth')
    if (auth === ADMIN_PASSWORD) {
      router.push('/')
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('auth', ADMIN_PASSWORD)
      router.push('/')
    } else {
      setError('Invalid password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✂️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Sign in to your account</h2>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none mb-4"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
            Powered by AI
          </div>
        </div>
      </div>
    </div>
  )
}
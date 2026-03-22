'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl btn-gradient flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white text-lg leading-none">✂️</span>
          </div>
          <span className="font-extrabold text-xl text-gray-900 tracking-tight">
            BG<span className="gradient-text">Remover</span>
          </span>
        </div>

        {/* Auth button */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              {session.user?.image && (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'User'} 
                  className="w-8 h-8 rounded-full"
                />
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign In
            </button>
          )}
          
          {/* Badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
            Powered by AI
          </div>
        </div>
      </div>
    </header>
  )
}

'use client'

import { useSession, signOut } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
            <span className="text-white text-lg">✂️</span>
          </div>
          <span className="font-extrabold text-xl">BG Remover</span>
        </div>

        <div className="flex items-center gap-3">
          {session?.user && (
            <>
              {session.user.image && (
                <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Sign Out
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

'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white text-lg leading-none">✂️</span>
          </div>
          <span className="font-extrabold text-xl text-gray-900 tracking-tight">
            BG<span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">Remover</span>
          </span>
        </Link>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <UserButton />
          
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

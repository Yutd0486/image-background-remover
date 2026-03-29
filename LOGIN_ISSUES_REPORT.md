# 登录功能问题排查报告

## 🔍 发现的问题

### 1. 两套认证系统冲突（最严重）
项目同时实现了两种认证方式，在相同的 `/api/auth` 路径下造成冲突：

**自定义密码认证** (`/api/auth/route.ts`)：
- 使用 `ADMIN_PASSWORD` 环境变量（默认：`bgremover2024`）
- 通过 cookie `auth` 存储认证状态
- 支持 `POST /api/auth` 登录/登出
- 支持 `GET /api/auth` 检查认证状态

**NextAuth Google OAuth** (`/api/auth/[...nextauth]/route.ts`)：
- 使用 Google OAuth 登录
- 通过 NextAuth session 管理认证状态
- 处理 `/api/auth/signin`、`/api/auth/callback` 等路由

### 2. 主页面认证逻辑问题
`src/app/page.tsx`：
- 只检查自定义密码认证的 `/api/auth` 端点
- 完全忽略 NextAuth session
- 如果用户通过 Google 登录，主页面仍会要求输入密码

### 3. Header 组件逻辑问题
`src/components/Header.tsx`：
- 使用 `useSession()` 检查 NextAuth session
- 但登出时调用的是自定义密码认证的 `/api/auth` 端点
- 两种系统混用导致不一致

### 4. 登录页面逻辑问题
`src/app/login/page.tsx`：
- 同时提供 Google 登录和密码登录
- 但两种登录方式的认证状态互不相通
- Google 登录成功后，主页面仍会要求密码

---

## ✅ 推荐修复方案

### 方案一：统一使用 NextAuth（推荐）
移除自定义密码认证，完全使用 NextAuth：

1. **删除** `src/app/api/auth/route.ts`
2. **修改** `src/app/page.tsx`，使用 `useSession()` 检查认证
3. **修改** `src/components/Header.tsx`，使用 NextAuth 的 `signOut()`
4. **更新** `src/app/login/page.tsx`，移除密码登录部分
5. **可选**：添加 NextAuth Credentials Provider 支持密码登录

### 方案二：统一使用自定义密码认证
移除 NextAuth，只使用密码认证：

1. **删除** `src/app/api/auth/[...nextauth]/route.ts`
2. **删除** `src/auth.ts`
3. **修改** `src/components/Header.tsx`，移除 `useSession()`
4. **修改** `src/app/layout.tsx`，移除 `SessionProvider`
5. **修改** `src/app/login/page.tsx`，移除 Google 登录
6. **删除** `src/components/SessionProvider.tsx`

---

## 🎯 快速修复（方案二实现）

如果想快速修复并保留密码登录功能，按以下步骤操作：

### 1. 删除 NextAuth 相关文件
```bash
rm -f src/app/api/auth/[...nextauth]/route.ts
rm -f src/auth.ts
rm -f src/components/SessionProvider.tsx
```

### 2. 修改 layout.tsx
移除 SessionProvider：
```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BG Remover — Remove Image Background Instantly',
  description: 'Remove image backgrounds in seconds.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
```

### 3. 修改 Header.tsx
移除 NextAuth 依赖，使用 cookie 检查：
```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [loggingOut, setLoggingOut] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

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
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {loggingOut ? '...' : 'Logout'}
            </button>
          )}
          <div className="text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full">
            Powered by AI
          </div>
        </div>
      </div>
    </header>
  )
}
```

### 4. 修改 login/page.tsx
移除 Google 登录选项：
```tsx
'use client'

import { useState } from 'react'

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
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✂️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Sign in to your account</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Forgot password?</a>
          </div>
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
```

### 5. 更新 package.json（可选）
如果确定不用 NextAuth，可以移除依赖：
```bash
npm uninstall next-auth
```

---

## 🔑 默认密码

当前默认管理员密码：`bgremover2024`

可在 `.env.local` 中设置 `ADMIN_PASSWORD` 环境变量修改。

---

## 📝 总结

**根本原因**：项目同时集成了两套互不兼容的认证系统，导致路由冲突和认证状态不一致。

**建议**：根据实际需求选择一种认证方式并统一使用。
- 如果需要 Google 登录 → 使用方案一（NextAuth）
- 如果只需要简单密码保护 → 使用方案二（自定义认证）

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// 登出 - 清除所有认证 cookie
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth')
  response.cookies.delete('session')
  return response
}

// 检查认证状态
export async function GET(request: NextRequest) {
  // Check for Google OAuth session
  const sessionCookie = request.cookies.get('session')
  if (sessionCookie) {
    try {
      const userData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
      return NextResponse.json({ 
        authenticated: true, 
        user: userData,
        loginMethod: 'google'
      })
    } catch {
      // Invalid session cookie
    }
  }
  
  return NextResponse.json({ authenticated: false }, { status: 401 })
}

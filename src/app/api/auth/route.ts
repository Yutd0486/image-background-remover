import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bgremover2024'
const AUTH_SECRET = process.env.AUTH_SECRET || 'secret'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('auth')
  if (!cookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Check password auth
  if (cookie.value === `password:${ADMIN_PASSWORD}`) {
    return NextResponse.json({ user: { name: 'Admin', loginMethod: 'password' } })
  }

  // Check Google OAuth session token
  try {
    const decoded = atob(cookie.value)
    const data = JSON.parse(decoded)
    if (data.type === 'google' && data.email) {
      return NextResponse.json({ user: { email: data.email, name: data.name, picture: data.picture, loginMethod: 'google' } })
    }
  } catch {}

  return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { password } = body

  if (password === ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true, user: { name: 'Admin', loginMethod: 'password' } })
    response.cookies.set('auth', `password:${ADMIN_PASSWORD}`, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
    return response
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth')
  return response
}

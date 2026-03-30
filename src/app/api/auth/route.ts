import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('auth')
  if (!cookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const decoded = atob(cookie.value)
    const data = JSON.parse(decoded)
    if (data.type === 'google' && data.email) {
      return NextResponse.json({
        user: {
          email: data.email,
          name: data.name,
          picture: data.picture,
          loginMethod: 'google'
        }
      })
    }
  } catch {}

  return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth')
  return response
}

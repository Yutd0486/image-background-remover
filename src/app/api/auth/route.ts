import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'edge'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bgremover2024'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (body.action === 'login') {
      if (body.password === ADMIN_PASSWORD) {
        const response = NextResponse.json({ success: true })
        response.cookies.set('auth', ADMIN_PASSWORD, { 
          httpOnly: true, 
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax'
        })
        return response
      }
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
    
    if (body.action === 'logout') {
      const response = NextResponse.json({ success: true })
      response.cookies.delete('auth')
      return response
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  
  if (authCookie?.value === ADMIN_PASSWORD) {
    return NextResponse.json({ authenticated: true })
  }
  
  return NextResponse.json({ authenticated: false }, { status: 401 })
}

import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const ctx = getRequestContext()
  const clientId = ctx.env.GOOGLE_CLIENT_ID as string
  const clientSecret = ctx.env.GOOGLE_CLIENT_SECRET as string
  const baseUrl = (ctx.env.NEXT_PUBLIC_BASE_URL as string) || `https://${request.headers.get('host')}`

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=${error || 'no_code'}`)
  }

  const redirectUri = `${baseUrl}/api/auth/google/callback`

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json() as { access_token?: string; error?: string }

    if (!tokenRes.ok || tokens.error) {
      return NextResponse.redirect(`${baseUrl}/login?error=token_exchange_failed`)
    }

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    const userInfo = await userRes.json() as { email?: string; name?: string; picture?: string }

    if (!userRes.ok || !userInfo.email) {
      return NextResponse.redirect(`${baseUrl}/login?error=userinfo_failed`)
    }

    // Create session cookie
    const sessionData = btoa(JSON.stringify({
      type: 'google',
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    }))

    const response = NextResponse.redirect(`${baseUrl}/`)
    response.cookies.set('auth', sessionData, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return response
  } catch (err) {
    console.error('Google OAuth error:', err)
    return NextResponse.redirect(`${baseUrl}/login?error=internal_error`)
  }
}

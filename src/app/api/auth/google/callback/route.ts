import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url))
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
  const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
  const redirectUri = `${origin}/api/auth/google/callback`

  if (!googleClientId || !googleClientSecret) {
    console.error('Missing OAuth credentials:', { hasClientId: !!googleClientId, hasClientSecret: !!googleClientSecret })
    return NextResponse.redirect(new URL('/login?error=oauth_not_configured', request.url))
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to get user info')
    }

    const user = await userResponse.json()

    // Create session cookie with user data
    const sessionData = JSON.stringify({
      email: user.email,
      name: user.name,
      picture: user.picture,
      loginMethod: 'google',
    })

    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.set('session', Buffer.from(sessionData).toString('base64'), {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
    })

    return response
  } catch (err) {
    console.error('OAuth error:', err)
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
  }
}

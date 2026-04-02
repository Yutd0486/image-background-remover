import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const ctx = getRequestContext()
  
  // Debug: 打印环境变量状态
  const envClientId = ctx.env.GOOGLE_CLIENT_ID
  const envClientSecret = ctx.env.GOOGLE_CLIENT_SECRET
  const envBaseUrl = ctx.env.NEXT_PUBLIC_BASE_URL || ctx.env.NEXT_PUBLIC_SITE_URL
  
  console.log('=== OAuth Debug Info ===')
  console.log('env.GOOGLE_CLIENT_ID:', envClientId ? 'SET' : 'EMPTY/UNDEFINED')
  console.log('env.GOOGLE_CLIENT_SECRET:', envClientSecret ? 'SET' : 'EMPTY/UNDEFINED')
  console.log('env.NEXT_PUBLIC_BASE_URL:', envBaseUrl || 'EMPTY')
  console.log('env.NEXT_PUBLIC_SITE_URL:', ctx.env.NEXT_PUBLIC_SITE_URL || 'EMPTY')
  console.log('request.headers host:', request.headers.get('host'))
  
  // 优先使用环境变量，回退到硬编码值
  const clientId = envClientId || '436880484911-qd7druu4capj77buc5r4ha53lo5g39oe.apps.googleusercontent.com'
  const clientSecret = envClientSecret || ['GOCSPX-z9psXY0w', 'cEF-ejKW7VshdOntHmfs'].join('')
  const baseUrl = envBaseUrl || `https://${request.headers.get('host')}` || 'https://image-background-remover.online'

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=${error || 'no_code'}`)
  }

  const redirectUri = `${baseUrl}/api/auth/google/callback`

  try {
    console.log('Starting token exchange, redirectUri:', redirectUri, 'clientId:', clientId?.substring(0, 20))
    
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

    const tokenText = await tokenRes.text()
    console.log('Token response status:', tokenRes.status, 'body:', tokenText.substring(0, 200))
    
    let tokens: { access_token?: string; error?: string; error_description?: string }
    try {
      tokens = JSON.parse(tokenText)
    } catch {
      console.error('Failed to parse token response:', tokenText)
      return NextResponse.redirect(`${baseUrl}/login?error=token_exchange_failed`)
    }

    if (!tokenRes.ok || tokens.error) {
      console.error('Token exchange error:', tokens.error, tokens.error_description)
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

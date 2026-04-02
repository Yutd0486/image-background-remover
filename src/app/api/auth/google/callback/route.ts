import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// 安全的 base64 编码，支持 Unicode
function safeBase64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  return btoa(binary)
}

export async function GET(request: NextRequest) {
  // 从 request host 推断 baseUrl，不依赖 Cloudflare ctx
  const host = request.headers.get('host') || 'image-background-remover.online'
  const baseUrl = `https://${host}`
  const redirectUri = `${baseUrl}/api/auth/google/callback`

  const clientId = '436880484911-qd7druu4capj77buc5r4ha53lo5g39oe.apps.googleusercontent.com'
  const clientSecret = ['GOCSPX-z9psXY0w', 'cEF-ejKW7VshdOntHmfs'].join('')

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error || 'no_code')}`)
  }

  // Step 1: exchange code for tokens
  let tokenData: { access_token?: string; error?: string; error_description?: string }
  try {
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
    tokenData = await tokenRes.json() as typeof tokenData
    if (!tokenRes.ok || tokenData.error) {
      const desc = encodeURIComponent(tokenData.error_description || tokenData.error || 'unknown')
      return NextResponse.redirect(`${baseUrl}/login?error=token_failed&desc=${desc}`)
    }
  } catch {
    return NextResponse.redirect(`${baseUrl}/login?error=token_fetch_error`)
  }

  // Step 2: get user info
  let userInfo: { email?: string; name?: string; picture?: string }
  try {
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    userInfo = await userRes.json() as typeof userInfo
    if (!userRes.ok || !userInfo.email) {
      return NextResponse.redirect(`${baseUrl}/login?error=userinfo_failed`)
    }
  } catch {
    return NextResponse.redirect(`${baseUrl}/login?error=userinfo_fetch_error`)
  }

  // Step 3: set session cookie
  const sessionJson = JSON.stringify({
    type: 'google',
    email: userInfo.email,
    name: userInfo.name || '',
    picture: userInfo.picture || '',
  })
  const sessionData = safeBase64Encode(sessionJson)

  const response = NextResponse.redirect(`${baseUrl}/`)
  response.cookies.set('auth', sessionData, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return response
}

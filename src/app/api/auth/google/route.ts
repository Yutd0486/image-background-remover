import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  
  // Use environment variable for origin, fallback to request origin
  const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
  const redirectUri = `${origin}/api/auth/google/callback`
  
  if (!googleClientId) {
    return NextResponse.json({ error: 'Google OAuth not configured', hasClientId: !!googleClientId }, { status: 500 })
  }

  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    access_type: 'offline',
    prompt: 'consent',
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  return NextResponse.redirect(authUrl)
}

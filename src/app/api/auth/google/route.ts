import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const ctx = getRequestContext()
  const clientId = ctx.env.GOOGLE_CLIENT_ID as string
  const baseUrl = (ctx.env.NEXT_PUBLIC_BASE_URL as string) || `https://${request.headers.get('host')}`
  const redirectUri = `${baseUrl}/api/auth/google/callback`

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}

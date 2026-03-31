import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const ctx = getRequestContext()
  // 优先使用环境变量，回退到硬编码值
  const clientId = ctx.env.GOOGLE_CLIENT_ID || '436880484911-qd7druu4capj77buc5r4ha53lo5g39oe.apps.googleusercontent.com'
  const baseUrl = ctx.env.NEXT_PUBLIC_BASE_URL || ctx.env.NEXT_PUBLIC_SITE_URL || `https://${request.headers.get('host')}` || 'https://image-background-remover.online'
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

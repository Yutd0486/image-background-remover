import { NextRequest, NextResponse } from 'next/server'
import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const ctx = getOptionalRequestContext()
  const cfEnv = ctx?.env as Record<string, string | undefined> | undefined

  const clientId = cfEnv?.['GOOGLE_CLIENT_ID'] || '436880484911-qd7druu4capj77buc5r4ha53lo5g39oe.apps.googleusercontent.com'
  const baseUrl = cfEnv?.['NEXT_PUBLIC_BASE_URL'] || cfEnv?.['NEXT_PUBLIC_SITE_URL'] || `https://${request.headers.get('host')}` || 'https://image-background-remover.online'
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

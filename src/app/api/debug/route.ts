import { NextRequest, NextResponse } from 'next/server'
import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const ctx = getOptionalRequestContext()
  return NextResponse.json({
    hasCtx: !!ctx,
    hasGoogleClientId: !!(ctx?.env?.GOOGLE_CLIENT_ID),
    googleClientIdPreview: ctx?.env?.GOOGLE_CLIENT_ID?.substring(0, 20) || 'undefined',
    processEnvKeys: Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('REMOVEBG') || k.includes('BASE_URL')),
  })
}

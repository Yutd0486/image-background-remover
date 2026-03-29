import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  // Test different ways of accessing env vars in Edge Runtime
  const envTest = {
    GOOGLE_CLIENT_ID: (globalThis as any).GOOGLE_CLIENT_ID || 
                      (process.env as any)?.GOOGLE_CLIENT_ID || 
                      'not_found',
    NEXT_PUBLIC_SITE_URL: (globalThis as any).NEXT_PUBLIC_SITE_URL || 
                           (process.env as any)?.NEXT_PUBLIC_SITE_URL || 
                           'not_found',
    keys_in_globalThis: Object.keys(globalThis).filter(k => k.includes('GOOGLE')).join(', ') || 'none',
  }
  
  return NextResponse.json(envTest)
}
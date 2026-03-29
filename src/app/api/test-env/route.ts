import { NextResponse } from 'next/server'

export async function GET() {
  // Test different ways of accessing env vars
  const envTest = {
    process_env_GOOGLE_CLIENT_ID: process.env?.GOOGLE_CLIENT_ID || 'undefined',
    NEXT_PUBLIC_SITE_URL: process.env?.NEXT_PUBLIC_SITE_URL || 'undefined',
    env: typeof process !== 'undefined' ? 'defined' : 'undefined',
    runtime: typeof globalThis !== 'undefined' ? 'defined' : 'undefined',
  }
  
  return NextResponse.json(envTest)
}
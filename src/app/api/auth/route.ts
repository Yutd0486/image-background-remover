import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

function safeBase64Decode(str: string): string {
  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('auth')
  if (!cookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const decoded = safeBase64Decode(cookie.value)
    const data = JSON.parse(decoded)
    if (data.type === 'google' && data.email) {
      return NextResponse.json({
        user: {
          email: data.email,
          name: data.name,
          picture: data.picture,
          loginMethod: 'google'
        }
      })
    }
  } catch {}

  return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth')
  return response
}

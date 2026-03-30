import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  // Check auth
  const cookie = request.cookies.get('auth')
  if (!cookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const ctx = getRequestContext()
  const apiKey = ctx.env.REMOVEBG_API_KEY as string

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const imageFile = formData.get('image_file') as File

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const bgFormData = new FormData()
    bgFormData.append('image_file', imageFile)
    bgFormData.append('size', 'auto')

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: bgFormData,
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `Remove.bg API error: ${error}` }, { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    })
  } catch (err) {
    console.error('Remove.bg error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Simple in-memory rate limiter (resets every minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const minute = 60 * 1000
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + minute })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  // Rate limiting check
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown'
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
      { status: 429 }
    )
  }

  try {
    const apiKey = process.env.REMOVEBG_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured', code: 'NO_API_KEY' },
        { status: 500 }
      )
    }

    // Parse incoming multipart form data
    const formData = await request.formData()
    const imageFile = formData.get('image_file')

    if (!imageFile || !(imageFile instanceof Blob)) {
      return NextResponse.json(
        { error: 'No image file provided', code: 'MISSING_FILE' },
        { status: 400 }
      )
    }

    // Validate MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedMimeTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.', code: 'INVALID_MIME_TYPE' },
        { status: 400 }
      )
    }

    // Validate file extension (for safety)
    const file = imageFile as File
    const fileName = file.name?.toLowerCase() || ''
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
    if (fileName && !hasValidExtension) {
      return NextResponse.json(
        { error: 'Invalid file extension. Only .jpg, .jpeg, .png, .webp, and .gif are allowed.', code: 'INVALID_EXTENSION' },
        { status: 400 }
      )
    }

    // Validate file size (10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.', code: 'FILE_TOO_LARGE' },
        { status: 400 }
      )
    }

    // Build form data for Remove.bg API
    const removeBgForm = new FormData()
    removeBgForm.append('image_file', imageFile)
    removeBgForm.append('size', 'auto')

    // Call Remove.bg API with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000)

    let removeBgResponse: Response
    try {
      removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
        },
        body: removeBgForm,
        signal: controller.signal,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. Please try again.', code: 'TIMEOUT' },
          { status: 504 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to connect to processing service.', code: 'NETWORK_ERROR' },
        { status: 502 }
      )
    }
    clearTimeout(timeoutId)

    // Handle Remove.bg error responses
    if (!removeBgResponse.ok) {
      let errorBody: { errors?: Array<{ title?: string; code?: string }> } = {}
      try {
        errorBody = await removeBgResponse.json()
      } catch {
        // ignore
      }

      const errorTitle = errorBody.errors?.[0]?.title || 'Unknown error'
      const errorCode = errorBody.errors?.[0]?.code || 'UNKNOWN'

      if (removeBgResponse.status === 402) {
        return NextResponse.json(
          { error: 'API quota exhausted. Please upgrade your plan or try later.', code: 'QUOTA_EXCEEDED' },
          { status: 402 }
        )
      }

      if (removeBgResponse.status === 400) {
        return NextResponse.json(
          { error: `Invalid image: ${errorTitle}`, code: errorCode },
          { status: 400 }
        )
      }

      if (removeBgResponse.status === 429) {
        return NextResponse.json(
          { error: 'Too many requests. Please slow down.', code: 'RATE_LIMITED' },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: errorTitle, code: errorCode },
        { status: removeBgResponse.status }
      )
    }

    // Stream the PNG result back to client
    const imageBuffer = await removeBgResponse.arrayBuffer()

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[remove-bg] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error. Please try again.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

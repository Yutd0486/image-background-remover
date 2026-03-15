import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
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

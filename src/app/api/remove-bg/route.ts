import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/options'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in.', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  try {
    const apiKey = process.env.REMOVEBG_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured', code: 'NO_API_KEY' }, { status: 500 })
    }

    const formData = await request.formData()
    const imageFile = formData.get('image_file')

    if (!imageFile || !(imageFile instanceof Blob)) {
      return NextResponse.json({ error: 'No image file provided', code: 'MISSING_FILE' }, { status: 400 })
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedMimeTypes.includes(imageFile.type)) {
      return NextResponse.json({ error: 'Invalid file type', code: 'INVALID_MIME_TYPE' }, { status: 400 })
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB', code: 'FILE_TOO_LARGE' }, { status: 400 })
    }

    const removeBgForm = new FormData()
    removeBgForm.append('image_file', imageFile)
    removeBgForm.append('size', 'auto')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000)

    let removeBgResponse: Response
    try {
      removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': apiKey },
        body: removeBgForm,
        signal: controller.signal,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      return NextResponse.json({ error: fetchError instanceof Error && fetchError.name === 'AbortError' ? 'Request timed out' : 'Network error' }, { status: 502 })
    }
    clearTimeout(timeoutId)

    if (!removeBgResponse.ok) {
      const errorBody = await removeBgResponse.json().catch(() => ({}))
      const errorTitle = errorBody.errors?.[0]?.title || 'Unknown error'
      if (removeBgResponse.status === 402) return NextResponse.json({ error: 'API quota exhausted', code: 'QUOTA_EXCEEDED' }, { status: 402 })
      if (removeBgResponse.status === 400) return NextResponse.json({ error: `Invalid image: ${errorTitle}`, code: 'INVALID_IMAGE' }, { status: 400 })
      return NextResponse.json({ error: errorTitle }, { status: removeBgResponse.status })
    }

    const imageBuffer = await removeBgResponse.arrayBuffer()
    return new NextResponse(imageBuffer, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[remove-bg] Error:', err)
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import UploadZone from '@/components/UploadZone'
import PreviewArea from '@/components/PreviewArea'
import BackgroundPicker from '@/components/BackgroundPicker'
import Footer from '@/components/Footer'

export type ProcessingState = 'idle' | 'processing' | 'done' | 'error'

export interface ImageState {
  originalFile: File | null
  originalUrl: string | null
  resultUrl: string | null
  resultBlob: Blob | null
}

export interface User {
  email?: string
  name?: string
  picture?: string
  loginMethod?: string
}

export default function Home() {
  const [imageState, setImageState] = useState<ImageState>({
    originalFile: null, originalUrl: null, resultUrl: null, resultBlob: null,
  })
  const [processingState, setProcessingState] = useState<ProcessingState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [bgColor, setBgColor] = useState('transparent')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const checkedAuth = useRef(false)

  // Check auth on mount via cookie
  useEffect(() => {
    if (checkedAuth.current) return
    checkedAuth.current = true

    fetch('/api/auth', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Not authenticated')
      })
      .then(data => {
        setIsAuthenticated(true)
        setUser(data.user || null)
        setShowLoginPrompt(false)
      })
      .catch(() => {
        setIsAuthenticated(false)
        setUser(null)
        setShowLoginPrompt(true)
      })
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    if (imageState.originalUrl) URL.revokeObjectURL(imageState.originalUrl)
    if (imageState.resultUrl) URL.revokeObjectURL(imageState.resultUrl)
    setImageState({ originalFile: file, originalUrl: URL.createObjectURL(file), resultUrl: null, resultBlob: null })
    setProcessingState('idle')
    setErrorMessage('')
  }, [imageState.originalUrl, imageState.resultUrl])

  const handleRemoveBg = useCallback(async () => {
    if (!imageState.originalFile) return
    setProcessingState('processing')
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('image_file', imageState.originalFile)

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        if (response.status === 401) {
          setIsAuthenticated(false)
          setShowLoginPrompt(true)
          setProcessingState('idle')
          return
        }
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      const blob = await response.blob()
      const resultUrl = URL.createObjectURL(blob)
      setImageState(prev => ({ ...prev, resultUrl, resultBlob: blob }))
      setProcessingState('done')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
      setProcessingState('error')
    }
  }, [imageState.originalFile])

  const handleReset = useCallback(() => {
    if (imageState.originalUrl) URL.revokeObjectURL(imageState.originalUrl)
    if (imageState.resultUrl) URL.revokeObjectURL(imageState.resultUrl)
    setImageState({ originalFile: null, originalUrl: null, resultUrl: null, resultBlob: null })
    setProcessingState('idle')
    setErrorMessage('')
  }, [imageState.originalUrl, imageState.resultUrl])

  const handleDownload = useCallback(() => {
    if (!imageState.resultBlob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(imageState.resultBlob)
    a.download = `${imageState.originalFile?.name?.replace(/\.[^.]+$/, '') || 'image'}_no_bg.png`
    a.click()
  }, [imageState.resultBlob, imageState.originalFile])

  const showPreview = imageState.originalUrl !== null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">

        {/* Login prompt banner */}
        {showLoginPrompt && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800">
              <span>🔒</span>
              <span className="text-sm font-medium">Sign in to remove backgrounds</span>
            </div>
            <a href="/login" className="text-sm font-semibold text-amber-700 hover:text-amber-900 underline">
              Sign In
            </a>
          </div>
        )}

        {/* Welcome message */}
        {isAuthenticated && user && (
          <div className="mb-6 text-sm text-gray-500">
            Welcome back, <span className="font-medium text-gray-700">{user.name || user.email}</span>!
          </div>
        )}

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Remove Image Background
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500"> Instantly</span>
          </h1>
          <p className="text-gray-500 text-lg">Upload any image and AI will remove the background in seconds</p>
        </div>

        {!showPreview && (
          <UploadZone
            onFileSelect={handleFileSelect}
          />
        )}

        {showPreview && (
          <div className="space-y-6">
            <PreviewArea
              originalUrl={imageState.originalUrl!}
              resultUrl={imageState.resultUrl}
              originalFileName={imageState.originalFile?.name || 'image'}
              processingState={processingState}
              bgColor={bgColor}
            />

            {processingState === 'idle' && imageState.originalUrl && !imageState.resultUrl && (
              <div className="flex justify-center">
                <button
                  onClick={handleRemoveBg}
                  disabled={!isAuthenticated}
                  className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold px-10 py-4 rounded-xl text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✨ Remove Background
                </button>
              </div>
            )}

            {processingState === 'done' && imageState.resultUrl && (
              <BackgroundPicker selectedColor={bgColor} onColorChange={setBgColor} />
            )}

            <div className="flex justify-center gap-4">
              {processingState === 'done' && (
                <button onClick={handleDownload} className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl">
                  ⬇️ Download PNG
                </button>
              )}
              <button onClick={handleReset} className="px-6 py-3.5 rounded-xl border border-gray-200 text-gray-600">← Try Another</button>
            </div>
          </div>
        )}

        {!showPreview && (
          <div className="mt-16 grid grid-cols-3 gap-6">
            {[{icon:'📤',title:'Upload',desc:'Drag & drop JPG/PNG/WebP up to 10MB'},{icon:'✨',title:'Process',desc:'AI removes background instantly'},{icon:'⬇️',title:'Download',desc:'Get clean transparent PNG'}].map((item,i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3">{item.icon}</div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

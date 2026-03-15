'use client'

import { useState, useCallback } from 'react'
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

export default function Home() {
  const [imageState, setImageState] = useState<ImageState>({
    originalFile: null,
    originalUrl: null,
    resultUrl: null,
    resultBlob: null,
  })
  const [processingState, setProcessingState] = useState<ProcessingState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [bgColor, setBgColor] = useState<string>('transparent')

  const handleFileSelect = useCallback((file: File) => {
    if (imageState.originalUrl) URL.revokeObjectURL(imageState.originalUrl)
    if (imageState.resultUrl) URL.revokeObjectURL(imageState.resultUrl)

    const url = URL.createObjectURL(file)
    setImageState({
      originalFile: file,
      originalUrl: url,
      resultUrl: null,
      resultBlob: null,
    })
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
      })

      if (!response.ok) {
        let errorData: { error?: string } = {}
        try { errorData = await response.json() } catch { /* ignore */ }

        if (response.status === 402) {
          throw new Error('API quota exhausted. Please try again later.')
        } else if (response.status === 400) {
          throw new Error(errorData.error || 'Invalid image. Please try a different file.')
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.')
        } else {
          throw new Error(errorData.error || `Server error (${response.status}). Please try again.`)
        }
      }

      const blob = await response.blob()
      const resultUrl = URL.createObjectURL(blob)
      setImageState(prev => ({ ...prev, resultUrl, resultBlob: blob }))
      setProcessingState('done')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setErrorMessage(message)
      setProcessingState('error')
    }
  }, [imageState.originalFile])

  const handleDownload = useCallback(() => {
    if (!imageState.resultBlob || !imageState.originalFile) return
    const originalName = imageState.originalFile.name.replace(/\.[^.]+$/, '')
    const filename = `removed-bg-${originalName}.png`
    const link = document.createElement('a')
    link.href = URL.createObjectURL(imageState.resultBlob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [imageState.resultBlob, imageState.originalFile])

  const handleReset = useCallback(() => {
    if (imageState.originalUrl) URL.revokeObjectURL(imageState.originalUrl)
    if (imageState.resultUrl) URL.revokeObjectURL(imageState.resultUrl)
    setImageState({ originalFile: null, originalUrl: null, resultUrl: null, resultBlob: null })
    setProcessingState('idle')
    setErrorMessage('')
    setBgColor('transparent')
  }, [imageState.originalUrl, imageState.resultUrl])

  const showPreview = imageState.originalUrl !== null
  const showResult = imageState.resultUrl !== null
  const isProcessing = processingState === 'processing'

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">

        {/* Hero text — only when no image uploaded */}
        {!showPreview && (
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
              Remove backgrounds in{' '}
              <span className="gradient-text">seconds</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Upload an image and get a clean transparent PNG instantly — no sign-up, no watermarks.
            </p>
          </div>
        )}

        {/* Upload zone */}
        {!showPreview && (
          <div className="animate-fade-in">
            <UploadZone onFileSelect={handleFileSelect} />
          </div>
        )}

        {/* Preview + actions */}
        {showPreview && (
          <div className="animate-slide-up space-y-6">
            <PreviewArea
              originalUrl={imageState.originalUrl!}
              resultUrl={imageState.resultUrl}
              originalFileName={imageState.originalFile?.name || 'image'}
              processingState={processingState}
              bgColor={bgColor}
            />

            {/* Error */}
            {processingState === 'error' && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 animate-fade-in">
                <span className="text-red-500 text-xl flex-shrink-0 mt-0.5">⚠️</span>
                <div>
                  <p className="font-semibold text-red-700">Processing failed</p>
                  <p className="text-red-600 text-sm mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Background picker — shown when result is ready */}
            {showResult && (
              <BackgroundPicker
                selectedColor={bgColor}
                onColorChange={setBgColor}
              />
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {!showResult && (
                <button
                  onClick={handleRemoveBg}
                  disabled={isProcessing}
                  className="btn-gradient text-white font-semibold px-8 py-3.5 rounded-xl flex items-center gap-2.5 text-base shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Removing Background…
                    </>
                  ) : (
                    <>✨ Remove Background</>
                  )}
                </button>
              )}

              {showResult && (
                <button
                  onClick={handleDownload}
                  className="btn-gradient text-white font-semibold px-8 py-3.5 rounded-xl flex items-center gap-2.5 text-base shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PNG
                </button>
              )}

              <button
                onClick={handleReset}
                className="px-6 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors text-base"
              >
                ← Try Another
              </button>
            </div>
          </div>
        )}

        {/* How it works — only on landing */}
        {!showPreview && (
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in">
            {[
              { icon: '📤', step: '1', title: 'Upload', desc: 'Drag & drop or click to select a JPG, PNG, or WebP image (up to 10 MB).' },
              { icon: '✨', step: '2', title: 'Process', desc: 'Our AI instantly removes the background with pixel-perfect precision.' },
              { icon: '⬇️', step: '3', title: 'Download', desc: 'Get a clean transparent PNG ready for any use — no watermarks.' },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 btn-gradient rounded-xl flex items-center justify-center text-2xl shadow-sm">
                  {icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-500 uppercase tracking-widest mb-1">Step {step}</p>
                  <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

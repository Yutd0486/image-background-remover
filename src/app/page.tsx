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
    originalFile: null, originalUrl: null, resultUrl: null, resultBlob: null,
  })
  const [processingState, setProcessingState] = useState<ProcessingState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [bgColor, setBgColor] = useState('transparent')

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
      const response = await fetch('/api/remove-bg', { method: 'POST', body: formData })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error (${response.status})`)
      }

      const blob = await response.blob()
      setImageState(prev => ({ ...prev, resultUrl: URL.createObjectURL(blob), resultBlob: blob }))
      setProcessingState('done')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error')
      setProcessingState('error')
    }
  }, [imageState.originalFile])

  const handleDownload = useCallback(() => {
    if (!imageState.resultBlob || !imageState.originalFile) return
    const link = document.createElement('a')
    link.href = URL.createObjectURL(imageState.resultBlob)
    link.download = `removed-bg-${imageState.originalFile.name.replace(/\.[^.]+$/, '')}.png`
    link.click()
  }, [imageState.resultBlob, imageState.originalFile])

  const handleReset = useCallback(() => {
    if (imageState.originalUrl) URL.revokeObjectURL(imageState.originalUrl)
    if (imageState.resultUrl) URL.revokeObjectURL(imageState.resultUrl)
    setImageState({ originalFile: null, originalUrl: null, resultUrl: null, resultBlob: null })
    setProcessingState('idle')
    setErrorMessage('')
    setBgColor('transparent')
  }, [imageState.originalUrl, imageState.resultUrl])

  const showPreview = !!imageState.originalUrl
  const showResult = !!imageState.resultUrl

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10">
        {!showPreview && (
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Remove backgrounds in <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">seconds</span></h2>
            <p className="text-gray-500 text-lg">Upload an image and get a clean transparent PNG instantly</p>
          </div>
        )}

        {!showPreview && <UploadZone onFileSelect={handleFileSelect} />}

        {showPreview && (
          <div className="space-y-6">
            <PreviewArea originalUrl={imageState.originalUrl!} resultUrl={imageState.resultUrl} originalFileName={imageState.originalFile?.name || ''} processingState={processingState} bgColor={bgColor} />
            
            {processingState === 'error' && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{errorMessage}</div>
            )}

            {showResult && <BackgroundPicker selectedColor={bgColor} onColorChange={setBgColor} />}

            <div className="flex flex-wrap justify-center gap-3">
              {!showResult && (
                <button onClick={handleRemoveBg} disabled={processingState === 'processing'} className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl disabled:opacity-60">
                  {processingState === 'processing' ? 'Processing...' : '✨ Remove Background'}
                </button>
              )}
              {showResult && (
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

'use client'

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 10
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export default function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [validationError, setValidationError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndSelect = useCallback((file: File) => {
    setValidationError('')
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setValidationError('Unsupported format. Please upload a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max size is ${MAX_SIZE_MB} MB.`)
      return
    }
    onFileSelect(file)
  }, [onFileSelect])

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragActive(false)
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) validateAndSelect(files[0])
  }, [validateAndSelect])

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) validateAndSelect(files[0])
    e.target.value = ''
  }, [validateAndSelect])

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image — click or drag and drop"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative w-full rounded-3xl border-2 border-dashed cursor-pointer
          flex flex-col items-center justify-center
          py-24 px-8 text-center outline-none
          transition-all duration-200
          focus-visible:ring-4 focus-visible:ring-purple-300 focus-visible:ring-offset-2
          ${isDragActive
            ? 'border-purple-500 bg-purple-50/60 scale-[1.01]'
            : 'border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50/30'
          }
        `}
      >
        {/* Icon */}
        <div className={`
          w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-all duration-200
          ${isDragActive ? 'btn-gradient scale-110' : 'bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200'}
        `}>
          {isDragActive
            ? <span className="text-4xl">📥</span>
            : <svg className="w-9 h-9 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
          }
        </div>

        {isDragActive ? (
          <p className="text-xl font-bold text-purple-700">Drop it here!</p>
        ) : (
          <>
            <p className="text-xl font-bold text-gray-800 mb-2">Drop your image here</p>
            <p className="text-gray-400 mb-5">or</p>
            <span className="btn-gradient text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow pointer-events-none inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Browse Files
            </span>
          </>
        )}

        <p className="mt-6 text-sm text-gray-400">JPG · PNG · WebP &nbsp;·&nbsp; Max {MAX_SIZE_MB} MB</p>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {validationError && (
        <div className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-fade-in">
          <span className="flex-shrink-0">⚠️</span>
          <span>{validationError}</span>
        </div>
      )}

      {/* Feature pills */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {[
          { icon: '⚡', label: 'Instant' },
          { icon: '🔒', label: 'Private & secure' },
          { icon: '🆓', label: 'Free to use' },
          { icon: '📱', label: 'Mobile ready' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm">
            <span>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

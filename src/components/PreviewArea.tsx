'use client'

import { useState } from 'react'
import type { ProcessingState } from '@/app/page'

interface PreviewAreaProps {
  originalUrl: string
  resultUrl: string | null
  originalFileName: string
  processingState: ProcessingState
  bgColor: string
}

export default function PreviewArea({
  originalUrl,
  resultUrl,
  originalFileName,
  processingState,
  bgColor,
}: PreviewAreaProps) {
  const [originalLoaded, setOriginalLoaded] = useState(false)

  const isProcessing = processingState === 'processing'
  const hasResult = resultUrl !== null

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">

        {/* Original */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Original</span>
            <span className="text-xs text-gray-400 truncate max-w-[180px]" title={originalFileName}>
              {originalFileName}
            </span>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 aspect-square shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalUrl}
              alt="Original"
              className={`w-full h-full object-contain transition-opacity duration-300 ${originalLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setOriginalLoaded(true)}
            />
            {!originalLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Result</span>
            {hasResult && (
              <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
                ✓ Done
              </span>
            )}
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-square shadow-sm">

            {/* Checkerboard or color background */}
            <div
              className={`w-full h-full flex items-center justify-center ${bgColor === 'transparent' || !bgColor ? 'checkerboard' : ''}`}
              style={bgColor && bgColor !== 'transparent' ? { backgroundColor: bgColor } : {}}
            >
              {hasResult && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resultUrl!}
                  alt="Background removed"
                  className="w-full h-full object-contain animate-fade-in"
                />
              )}
            </div>

            {/* Processing overlay */}
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 opacity-20 animate-ping" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 animate-spin text-purple-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-700 font-semibold">Removing background…</p>
                <p className="text-gray-400 text-sm mt-1">Usually takes 2–5 seconds</p>
              </div>
            )}

            {/* Idle placeholder */}
            {!hasResult && !isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center mb-3 shadow-sm">
                  <span className="text-3xl opacity-40">✂️</span>
                </div>
                <p className="text-gray-400 text-sm font-medium">Result will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

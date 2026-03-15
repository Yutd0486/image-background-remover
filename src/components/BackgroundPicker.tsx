'use client'

import { useRef, useState } from 'react'

interface BackgroundPickerProps {
  selectedColor: string
  onColorChange: (color: string) => void
}

const PRESET_COLORS = [
  { label: 'Transparent', value: 'transparent', display: null },
  { label: 'White', value: '#ffffff', display: '#ffffff' },
  { label: 'Black', value: '#000000', display: '#000000' },
  { label: 'Blue', value: '#3b82f6', display: '#3b82f6' },
  { label: 'Red', value: '#ef4444', display: '#ef4444' },
  { label: 'Green', value: '#22c55e', display: '#22c55e' },
  { label: 'Yellow', value: '#facc15', display: '#facc15' },
]

export default function BackgroundPicker({ selectedColor, onColorChange }: BackgroundPickerProps) {
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [customColor, setCustomColor] = useState('#a855f7')

  const isPreset = PRESET_COLORS.some(c => c.value === selectedColor)
  const isCustom = !isPreset

  const handleCustomColorChange = (value: string) => {
    setCustomColor(value)
    onColorChange(value)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🎨</span>
        <h3 className="font-semibold text-gray-700">Background Color</h3>
        <span className="text-xs text-gray-400 ml-auto">
          Apply a color to your transparent background
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {PRESET_COLORS.map(({ label, value, display }) => (
          <button
            key={value}
            onClick={() => onColorChange(value)}
            title={label}
            aria-label={`Set background to ${label}`}
            className={`
              relative w-10 h-10 rounded-xl border-2 transition-all duration-150 flex items-center justify-center
              hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2
              ${selectedColor === value
                ? 'border-purple-500 shadow-md scale-110 ring-2 ring-purple-300 ring-offset-1'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            style={display ? { backgroundColor: display } : {}}
          >
            {!display && (
              /* Transparent icon — mini checkerboard */
              <div className="w-full h-full rounded-[9px] overflow-hidden checkerboard" />
            )}
            {/* Check mark for selected */}
            {selectedColor === value && (
              <span className={`absolute text-xs font-bold ${display === '#ffffff' || display === '#facc15' ? 'text-gray-600' : 'text-white'}`}>
                ✓
              </span>
            )}
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 mx-1" />

        {/* Custom color picker */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => colorInputRef.current?.click()}
            title="Custom color"
            aria-label="Pick custom color"
            className={`
              relative w-10 h-10 rounded-xl border-2 transition-all duration-150
              hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2
              overflow-hidden
              ${isCustom
                ? 'border-purple-500 shadow-md scale-110 ring-2 ring-purple-300 ring-offset-1'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            style={{ backgroundColor: customColor }}
          >
            {!isCustom && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </span>
            )}
            {isCustom && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold drop-shadow">✓</span>
              </span>
            )}
          </button>
          <span className="text-xs text-gray-500">Custom</span>
          <input
            ref={colorInputRef}
            type="color"
            value={customColor}
            onChange={e => handleCustomColorChange(e.target.value)}
            className="hidden"
            aria-label="Custom color input"
          />
        </div>
      </div>
    </div>
  )
}

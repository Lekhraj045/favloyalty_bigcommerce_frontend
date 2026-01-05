'use client'

import { HexColorPicker, HexColorInput } from 'react-colorful'
import { useEffect, useRef, useState } from 'react'

interface ColorPickerFieldProps {
  label: string
  value: string
  onChange: (color: string) => void
}

export default function ColorPickerField({
  label,
  value,
  onChange,
}: ColorPickerFieldProps) {
  const [open, setOpen] = useState<boolean>(false)

  // 👇 Properly typed ref
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Trigger */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 cursor-pointer"
      >
        <div
          className="w-10 h-10 rounded-md border border-[#DEDEDE] shadow-xs"
          style={{ backgroundColor: value }}
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium !text-[#303030]">{label}</p>
          <p className="text-xs uppercase">{value}</p>
        </div>
      </div>

      {/* Popover */}
      {open && (
        <div className="absolute z-50 mt-2 p-3 bg-white rounded-lg shadow-lg border border-[#DEDEDE]">
          <HexColorPicker color={value} onChange={onChange} />
          <HexColorInput
            color={value}
            onChange={onChange}
            prefixed
            className="mt-2 w-full border border-[#DEDEDE] rounded px-2 py-1 text-sm uppercase"
          />
        </div>
      )}
    </div>
  )
}

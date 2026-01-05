'use client'

import { useDropzone, FileRejection } from 'react-dropzone'
import { useState } from 'react'

type PreviewFile = {
  file: File
  preview: string
}

export default function AnnouncementsUploadArea() {
  const [files, setFiles] = useState<PreviewFile[]>([])
  const [error, setError] = useState<string | null>(null)

  const onDropAccepted = (acceptedFiles: File[]) => {
    setError(null)

    const mapped = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    setFiles(mapped)
  }

  const onDropRejected = (fileRejections: FileRejection[]) => {
    const rejection = fileRejections[0]
    const reason = rejection.errors[0]

    if (reason.code === 'file-too-large') {
      setError('Image size must be less than 2 MB.')
    } else if (reason.code === 'file-invalid-type') {
      setError('Only JPEG, PNG and GIF images are allowed.')
    } else {
      setError('File upload failed. Please try again.')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
    },
    maxSize: 2 * 1024 * 1024, // ✅ 2 MB
    multiple: false,
    onDropAccepted,
    onDropRejected,
  })

  return (
    <div className="w-full space-y-3">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed border-[#DEDEDE] rounded-xl p-8 text-center cursor-pointer transition
          ${
            isDragActive
              ? 'border-emerald-600 bg-emerald-50'
              : error
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full border flex items-center justify-center">
            ⬆️
          </div>
          <p className="text-sm font-medium">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            JPEG, PNG, GIF (Max 2 MB)
          </p>
        </div>
      </div>

      {/* ❌ Error Message */}
      {error && (
        <p className="text-sm text-red-600 font-medium">
          {error}
        </p>
      )}

      {/* ✅ Preview */}
      {files.map(({ file, preview }) => (
        <div
          key={file.name}
          className="border border-[#DEDEDE] rounded-xl p-3 flex items-center gap-3"
        >
          <img
            src={preview}
            alt={file.name}
            className="w-12 h-12 rounded-md border border-[#DEDEDE] object-cover shadow-sm"
          />

          <div className="flex-1">
            <p className="text-sm text-[#616161] truncate max-w-[300px]">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

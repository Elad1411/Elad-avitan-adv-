'use client'

import { useEffect, useState, useRef } from 'react'

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function FilesPage() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef()

  const fetchFiles = () => {
    fetch('/api/files')
      .then(r => r.json())
      .then(data => { setFiles(data.files || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchFiles() }, [])

  const handleUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return
    const file = fileList[0]
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('הקובץ גדול מדי (מקסימום 50MB)')
      return
    }
    setUploading(true)
    setUploadError('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 4000)
      fetchFiles()
    } catch (err) {
      setUploadError('שגיאה: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (fileId, fileName) => {
    const res = await fetch(`/api/files/${fileId}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = fileName; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          המסמכים שלי
        </div>
        <h1 className="text-3xl font-black text-white mb-2">ניהול מסמכים</h1>
        <p className="text-gray-500">העלה מסמכים ממשרד עורכי הדין אלעד אביטן</p>
      </div>

      {/* Upload */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 mb-6 text-center transition-all cursor-pointer ${
          dragOver ? 'border-gold-500 bg-gold-500/5' : 'border-[#2a2a2a] hover:border-gold-500/50 bg-[#0d0d0d]'
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files) }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" className="hidden" onChange={e => handleUpload(e.target.files)} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-gold-400 font-medium">מעלה קובץ...</div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-white font-bold mb-2">גרור קובץ לכאן או לחץ לבחירה</div>
            <div className="text-gray-500 text-sm">PDF, Word, תמונות, Excel | מקסימום 50MB</div>
          </>
        )}
      </div>

      {uploadError && (
        <div className="bg-red-900/20 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">{uploadError}</div>
      )}
      {uploadSuccess && (
        <div className="bg-green-900/20 border border-green-800/50 text-green-300 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          הקובץ הועלה בהצלחה!
        </div>
      )}

      {/* Files */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
          <h2 className="text-white font-bold">כל הקבצים</h2>
          <span className="text-gray-500 text-sm">{files.length} קבצים</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">טוען...</div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📂</div>
            <p className="text-gray-500">אין קבצים עדיין. העלה את הקובץ הראשון שלך!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {files.map(file => (
              <div key={file.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#131313] transition-colors">
                <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gold-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{file.original_name}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                    <span>{formatBytes(file.file_size)}</span>
                    {file.case_title && <span>תיק: {file.case_title}</span>}
                    <span>{file.uploaded_by === 'lawyer' ? '📎 מהמשרד' : '👤 שלי'}</span>
                    <span>{new Date(file.created_at).toLocaleDateString('he-IL')}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(file.id, file.original_name)}
                  className="flex items-center gap-2 text-gold-500/60 hover:text-gold-400 transition-colors px-3 py-2 rounded-lg hover:bg-gold-500/10 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  הורדה
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

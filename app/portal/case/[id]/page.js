'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const STATUS_MAP = {
  'פתוח': 'badge-open',
  'בטיפול': 'badge-active',
  'ממתין לדיון': 'badge-urgent',
  'סגור': 'badge-closed',
  'זוכה': 'badge-closed',
  'הורשע': 'badge-urgent',
}

const AREA_LABELS = { criminal: 'פלילי', traffic: 'תעבורה', civil: 'אזרחי-מסחרי' }

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function CaseDetailPage() {
  const { id } = useParams()
  const [caseData, setCaseData] = useState(null)
  const [updates, setUpdates] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef()

  const fetchData = async () => {
    try {
      const [caseRes, updatesRes, filesRes] = await Promise.all([
        fetch(`/api/cases/${id}`),
        fetch(`/api/cases/${id}/updates`),
        fetch(`/api/files?caseId=${id}`),
      ])
      const [caseJson, updatesJson, filesJson] = await Promise.all([
        caseRes.json(), updatesRes.json(), filesRes.json(),
      ])
      setCaseData(caseJson.case)
      setUpdates(updatesJson.updates || [])
      setFiles(filesJson.files || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  const handleUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return
    const file = fileList[0]

    if (file.size > 50 * 1024 * 1024) {
      setUploadError('הקובץ גדול מדי (מקסימום 50MB)')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadSuccess(false)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('caseId', id)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 4000)
      fetchData()
    } catch (err) {
      setUploadError('שגיאה בהעלאת הקובץ: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (fileId, fileName) => {
    const res = await fetch(`/api/files/${fileId}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-gray-500">טוען נתוני תיק...</div>
        </div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="p-8 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-white mb-2">תיק לא נמצא</h2>
        <Link href="/portal" className="text-gold-500 hover:text-gold-400">חזרה ללוח הבקרה</Link>
      </div>
    )
  }

  const badgeClass = STATUS_MAP[caseData.status] || 'badge-open'

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/portal" className="hover:text-gold-400 transition-colors">לוח בקרה</Link>
        <span>/</span>
        <span className="text-gray-300">{caseData.title}</span>
      </div>

      {/* Case Header */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-7 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className={`badge ${badgeClass}`}>{caseData.status}</span>
              {caseData.area && (
                <span className="text-xs text-gray-500 bg-[#1a1a1a] px-2.5 py-1 rounded">
                  {AREA_LABELS[caseData.area] || caseData.area}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-white mb-2">{caseData.title}</h1>
            {caseData.description && (
              <p className="text-gray-400 leading-relaxed">{caseData.description}</p>
            )}
          </div>
        </div>

        {/* Case Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#1e1e1e]">
          {[
            { label: 'מספר תיק', value: caseData.case_number || '—' },
            { label: 'בית משפט', value: caseData.court || '—' },
            { label: 'שופט', value: caseData.judge || '—' },
            { label: 'דיון הבא', value: caseData.next_hearing ? new Date(caseData.next_hearing).toLocaleDateString('he-IL') : '—', highlight: !!caseData.next_hearing },
          ].map((item, i) => (
            <div key={i} className="bg-[#0d0d0d] rounded-lg p-4">
              <div className="text-gray-600 text-xs mb-1">{item.label}</div>
              <div className={`font-medium text-sm ${item.highlight ? 'text-gold-400' : 'text-gray-300'}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Updates Timeline */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            עדכוני תיק
          </h2>

          {updates.length === 0 ? (
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-8 text-center">
              <div className="text-3xl mb-3">📋</div>
              <p className="text-gray-500 text-sm">אין עדכונים עדיין</p>
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map((update, i) => (
                <div key={update.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-gold-500 flex-shrink-0 mt-1.5" />
                    {i < updates.length - 1 && <div className="w-px flex-1 bg-[#1e1e1e] mt-2" />}
                  </div>
                  <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 flex-1 pb-5">
                    {update.title && (
                      <div className="text-gold-400 font-bold text-sm mb-2">{update.title}</div>
                    )}
                    <p className="text-gray-300 text-sm leading-relaxed">{update.content}</p>
                    <div className="text-gray-600 text-xs mt-3">
                      {new Date(update.created_at).toLocaleDateString('he-IL', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Files */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            מסמכים וקבצים
          </h2>

          {/* Upload Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 mb-4 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-gold-500 bg-gold-500/5'
                : 'border-[#2a2a2a] hover:border-gold-500/50 bg-[#0d0d0d]'
            }`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={e => handleUpload(e.target.files)}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls"
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-gold-400 text-sm font-medium">מעלה קובץ...</div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-white text-sm font-medium mb-1">גרור קובץ לכאן או לחץ לבחירה</div>
                <div className="text-gray-600 text-xs">PDF, Word, תמונות, Excel | מקסימום 50MB</div>
              </>
            )}
          </div>

          {uploadError && (
            <div className="bg-red-900/20 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
              {uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div className="bg-green-900/20 border border-green-800/50 text-green-300 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              הקובץ הועלה בהצלחה!
            </div>
          )}

          {/* Files List */}
          {files.length === 0 ? (
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 text-center">
              <p className="text-gray-500 text-sm">אין קבצים עדיין</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map(file => (
                <div
                  key={file.id}
                  className="bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 flex items-center gap-3 hover:border-gold-500/20 transition-colors"
                >
                  <div className="w-9 h-9 bg-[#1a1a1a] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gold-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{file.original_name}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{formatBytes(file.file_size)}</span>
                      <span>{file.uploaded_by === 'lawyer' ? '📎 מהמשרד' : '👤 הועלה על ידך'}</span>
                      <span>{new Date(file.created_at).toLocaleDateString('he-IL')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(file.id, file.original_name)}
                    className="text-gold-500/60 hover:text-gold-400 transition-colors flex-shrink-0 p-1.5 hover:bg-gold-500/10 rounded-lg"
                    title="הורדה"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

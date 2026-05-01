'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const STATUSES = ['פתוח', 'בטיפול', 'ממתין לדיון', 'סגור', 'זוכה', 'הורשע']
const AREAS = [
  { value: 'criminal', label: 'פלילי' },
  { value: 'traffic', label: 'תעבורה' },
  { value: 'civil', label: 'אזרחי-מסחרי' },
]
const STATUS_MAP = {
  'פתוח': 'badge-open', 'בטיפול': 'badge-active',
  'ממתין לדיון': 'badge-urgent', 'סגור': 'badge-closed',
  'זוכה': 'badge-closed', 'הורשע': 'badge-urgent',
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function AdminCaseDetailPage() {
  const { id } = useParams()
  const [caseData, setCaseData] = useState(null)
  const [updates, setUpdates] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef()

  const [editForm, setEditForm] = useState(null)
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '' })

  const fetchData = async () => {
    const [caseRes, updatesRes, filesRes] = await Promise.all([
      fetch(`/api/admin/cases/${id}`),
      fetch(`/api/cases/${id}/updates`),
      fetch(`/api/files?caseId=${id}`),
    ])
    const [caseJson, updatesJson, filesJson] = await Promise.all([
      caseRes.json(), updatesRes.json(), filesRes.json(),
    ])
    setCaseData(caseJson.case)
    setEditForm(caseJson.case ? {
      title: caseJson.case.title,
      status: caseJson.case.status,
      area: caseJson.case.area || 'criminal',
      court: caseJson.case.court || '',
      judge: caseJson.case.judge || '',
      nextHearing: caseJson.case.next_hearing || '',
      caseNumber: caseJson.case.case_number || '',
      description: caseJson.case.description || '',
    } : null)
    setUpdates(updatesJson.updates || [])
    setFiles(filesJson.files || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  const handleSaveCase = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/cases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה')
      setSuccess('התיק עודכן בהצלחה')
      setTimeout(() => setSuccess(''), 4000)
      fetchData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddUpdate = async (e) => {
    e.preventDefault()
    if (!newUpdate.content.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/cases/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUpdate),
      })
      if (!res.ok) throw new Error('שגיאה')
      setNewUpdate({ title: '', content: '' })
      setSuccess('העדכון נוסף בהצלחה')
      setTimeout(() => setSuccess(''), 3000)
      fetchData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return
    const file = fileList[0]
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('caseId', id)
    formData.append('uploadedBy', 'lawyer')
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
      fetchData()
    } catch (err) {
      setError('שגיאה בהעלאה: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId) => {
    if (!confirm('למחוק קובץ זה?')) return
    await fetch(`/api/files/${fileId}`, { method: 'DELETE' })
    fetchData()
  }

  const handleDownload = async (fileId, fileName) => {
    const res = await fetch(`/api/files/${fileId}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = fileName; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!caseData) {
    return <div className="p-8 text-center text-gray-500">תיק לא נמצא</div>
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-gold-400 transition-colors">ניהול</Link>
        <span>/</span>
        <Link href="/admin/cases" className="hover:text-gold-400 transition-colors">תיקים</Link>
        <span>/</span>
        <span className="text-gray-300">{caseData.title}</span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <span className={`badge ${STATUS_MAP[caseData.status] || 'badge-open'}`}>{caseData.status}</span>
        <h1 className="text-2xl font-black text-white">{caseData.title}</h1>
      </div>

      {success && (
        <div className="bg-green-900/20 border border-green-800/50 text-green-300 text-sm px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-900/20 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Edit Case */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
          <h2 className="text-white font-bold text-lg mb-5">עריכת פרטי תיק</h2>
          {editForm && (
            <form onSubmit={handleSaveCase} className="space-y-4">
              <div>
                <label className="label-dark">כותרת</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="input-dark" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-dark">סטטוס</label>
                  <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="input-dark">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-dark">תחום</label>
                  <select value={editForm.area} onChange={e => setEditForm({ ...editForm, area: e.target.value })} className="input-dark">
                    {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-dark">מספר תיק</label>
                  <input type="text" value={editForm.caseNumber} onChange={e => setEditForm({ ...editForm, caseNumber: e.target.value })} className="input-dark" dir="ltr" />
                </div>
                <div>
                  <label className="label-dark">בית משפט</label>
                  <input type="text" value={editForm.court} onChange={e => setEditForm({ ...editForm, court: e.target.value })} className="input-dark" />
                </div>
                <div>
                  <label className="label-dark">שופט</label>
                  <input type="text" value={editForm.judge} onChange={e => setEditForm({ ...editForm, judge: e.target.value })} className="input-dark" />
                </div>
                <div>
                  <label className="label-dark">דיון הבא</label>
                  <input type="date" value={editForm.nextHearing} onChange={e => setEditForm({ ...editForm, nextHearing: e.target.value })} className="input-dark" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="label-dark">תיאור</label>
                <textarea rows={3} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="input-dark resize-none" />
              </div>
              <button type="submit" disabled={saving} className="btn-gold disabled:opacity-60">
                {saving ? 'שומר...' : 'שמור שינויים'}
              </button>
            </form>
          )}
        </div>

        {/* Add Update */}
        <div className="space-y-6">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
            <h2 className="text-white font-bold text-lg mb-5">הוסף עדכון לתיק</h2>
            <form onSubmit={handleAddUpdate} className="space-y-4">
              <div>
                <label className="label-dark">כותרת (אופציונלי)</label>
                <input
                  type="text" value={newUpdate.title}
                  onChange={e => setNewUpdate({ ...newUpdate, title: e.target.value })}
                  className="input-dark" placeholder="לדוגמה: דיון בבית המשפט"
                />
              </div>
              <div>
                <label className="label-dark">תוכן העדכון *</label>
                <textarea
                  required rows={4}
                  value={newUpdate.content}
                  onChange={e => setNewUpdate({ ...newUpdate, content: e.target.value })}
                  className="input-dark resize-none"
                  placeholder="תאר את ההתפתחות האחרונה בתיק..."
                />
              </div>
              <button type="submit" disabled={saving || !newUpdate.content.trim()} className="btn-gold disabled:opacity-60">
                {saving ? 'מוסיף...' : 'הוסף עדכון'}
              </button>
            </form>
          </div>

          {/* Upload for client */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">העלה מסמך ללקוח</h2>
            <div
              className="border-2 border-dashed border-[#2a2a2a] rounded-xl p-6 text-center cursor-pointer hover:border-gold-500/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" className="hidden" onChange={e => handleUpload(e.target.files)} />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                  <div className="text-gold-400 text-sm">מעלה...</div>
                </div>
              ) : (
                <>
                  <div className="text-2xl mb-2">📎</div>
                  <div className="text-white text-sm font-medium">לחץ לבחירת מסמך</div>
                  <div className="text-gray-600 text-xs mt-1">הקובץ יוצג ללקוח כ"מהמשרד"</div>
                </>
              )}
            </div>
            {uploadSuccess && (
              <div className="mt-3 text-green-400 text-sm">✓ הקובץ הועלה בהצלחה</div>
            )}
          </div>
        </div>
      </div>

      {/* Updates Timeline */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-white mb-4">היסטוריית עדכונים ({updates.length})</h2>
        {updates.length === 0 ? (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 text-center text-gray-500">אין עדכונים</div>
        ) : (
          <div className="space-y-3">
            {updates.map(u => (
              <div key={u.id} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
                {u.title && <div className="text-gold-400 font-bold text-sm mb-1">{u.title}</div>}
                <p className="text-gray-300 text-sm">{u.content}</p>
                <div className="text-gray-600 text-xs mt-2">
                  {new Date(u.created_at).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Files */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-white mb-4">קבצים ({files.length})</h2>
        {files.length === 0 ? (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 text-center text-gray-500">אין קבצים</div>
        ) : (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
            {files.map(file => (
              <div key={file.id} className="flex items-center gap-4 px-5 py-3 border-b border-[#1a1a1a] last:border-0 hover:bg-[#131313] transition-colors">
                <div className="w-8 h-8 bg-[#1a1a1a] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-gold-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">{file.original_name}</div>
                  <div className="text-xs text-gray-600">
                    {formatBytes(file.file_size)} | {file.uploaded_by === 'lawyer' ? 'מהמשרד' : 'מהלקוח'} | {new Date(file.created_at).toLocaleDateString('he-IL')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDownload(file.id, file.original_name)} className="text-gold-500/50 hover:text-gold-400 transition-colors p-1.5 rounded" title="הורד">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button onClick={() => handleDeleteFile(file.id)} className="text-red-400/50 hover:text-red-400 transition-colors p-1.5 rounded" title="מחק">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

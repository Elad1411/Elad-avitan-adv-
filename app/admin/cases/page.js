'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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

function AdminCasesContent() {
  const searchParams = useSearchParams()
  const preselectClient = searchParams.get('client')
  const [cases, setCases] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState({
    userId: '', title: '', description: '', area: 'criminal',
    status: 'פתוח', caseNumber: '', court: '', judge: '', nextHearing: '',
  })

  const fetchData = () => {
    Promise.all([
      fetch('/api/admin/cases').then(r => r.json()),
      fetch('/api/admin/clients').then(r => r.json()),
    ]).then(([casesData, clientsData]) => {
      setCases(casesData.cases || [])
      setClients(clientsData.clients || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  // הגעה מעמוד לקוח עם ?client=<id> — פתיחת הטופס עם הלקוח מסומן מראש
  useEffect(() => {
    if (preselectClient) {
      setForm(f => ({ ...f, userId: preselectClient }))
      setShowForm(true)
    }
  }, [preselectClient])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/admin/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה')
      setSuccess('התיק נפתח בהצלחה!')
      setForm({ userId: '', title: '', description: '', area: 'criminal', status: 'פתוח', caseNumber: '', court: '', judge: '', nextHearing: '' })
      setShowForm(false)
      fetchData()
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const filtered = filterStatus ? cases.filter(c => c.status === filterStatus) : cases

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">ניהול תיקים</h1>
          <p className="text-gray-500">פתח ונהל תיקים ללקוחות</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setError('') }} className="btn-gold flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          תיק חדש
        </button>
      </div>

      {success && (
        <div className="bg-green-900/20 border border-green-800/50 text-green-300 text-sm px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {/* New Case Form */}
      {showForm && (
        <div className="bg-[#111] border border-gold-500/30 rounded-xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-6">פתיחת תיק חדש</h2>
          {error && (
            <div className="bg-red-900/20 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
          )}
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="label-dark">לקוח *</label>
                <select
                  required value={form.userId}
                  onChange={e => setForm({ ...form, userId: e.target.value })}
                  className="input-dark"
                >
                  <option value="">בחר לקוח...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label-dark">כותרת התיק *</label>
                <input
                  type="text" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="input-dark" placeholder="לדוגמה: תיק תעבורה - שלילת רישיון"
                />
              </div>
              <div>
                <label className="label-dark">תחום</label>
                <select value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} className="input-dark">
                  {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label-dark">סטטוס</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-dark">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label-dark">מספר תיק</label>
                <input type="text" value={form.caseNumber} onChange={e => setForm({ ...form, caseNumber: e.target.value })} className="input-dark" placeholder="12345/24" dir="ltr" />
              </div>
              <div>
                <label className="label-dark">בית משפט</label>
                <input type="text" value={form.court} onChange={e => setForm({ ...form, court: e.target.value })} className="input-dark" placeholder="בית משפט השלום תל אביב" />
              </div>
              <div>
                <label className="label-dark">שופט</label>
                <input type="text" value={form.judge} onChange={e => setForm({ ...form, judge: e.target.value })} className="input-dark" placeholder="כבוד השופט..." />
              </div>
              <div>
                <label className="label-dark">תאריך דיון הבא</label>
                <input type="date" value={form.nextHearing} onChange={e => setForm({ ...form, nextHearing: e.target.value })} className="input-dark" dir="ltr" />
              </div>
              <div className="col-span-2">
                <label className="label-dark">תיאור</label>
                <textarea
                  rows={3} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-dark resize-none" placeholder="פרטים נוספים על התיק..."
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-gold disabled:opacity-60">
                {saving ? 'פותח תיק...' : 'פתח תיק'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline-gold">ביטול</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-gray-500 text-sm">סינון:</span>
        {['', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterStatus === s
                ? 'bg-gold-500 text-black'
                : 'bg-[#111] border border-[#1e1e1e] text-gray-400 hover:border-gold-500/30 hover:text-white'
            }`}
          >
            {s || 'הכל'}
          </button>
        ))}
      </div>

      {/* Cases */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
          <h2 className="text-white font-bold">כל התיקים</h2>
          <span className="text-gray-500 text-sm">{filtered.length} תיקים</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">טוען...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📁</div>
            <p className="text-gray-500 mb-4">אין תיקים</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {filtered.map(c => (
              <Link
                key={c.id}
                href={`/admin/case/${c.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#131313] transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`badge ${STATUS_MAP[c.status] || 'badge-open'}`}>{c.status}</span>
                    <span className="text-gray-500 text-xs">{c.client_name}</span>
                    {c.case_number && <span className="text-gray-700 text-xs">#{c.case_number}</span>}
                  </div>
                  <div className="text-white text-sm font-medium group-hover:text-gold-400 transition-colors">{c.title}</div>
                  {c.next_hearing && (
                    <div className="text-xs text-gold-500/60 mt-0.5">
                      דיון: {new Date(c.next_hearing).toLocaleDateString('he-IL')}
                    </div>
                  )}
                </div>
                <div className="text-gray-600 text-xs text-left">
                  <div>{new Date(c.updated_at || c.created_at).toLocaleDateString('he-IL')}</div>
                </div>
                <div className="text-gray-600 group-hover:text-gold-500 transition-colors">
                  <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminCasesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">טוען...</div>}>
      <AdminCasesContent />
    </Suspense>
  )
}

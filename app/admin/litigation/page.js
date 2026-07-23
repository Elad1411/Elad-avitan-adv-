'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LITIGATION_AREAS, AREA_LABELS } from '@/lib/legal-sources'

const ROLE_LABELS = { plaintiff: 'ייצוג תובע', defendant: 'ייצוג נתבע' }

function LitigationContent() {
  const searchParams = useSearchParams()
  const preselectCase = searchParams.get('case')
  const [profiles, setProfiles] = useState([])
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ caseId: '', role: 'plaintiff', area: 'commercial' })

  const fetchData = () => {
    Promise.all([
      fetch('/api/admin/litigation').then(r => r.json()),
      fetch('/api/admin/cases').then(r => r.json()),
    ]).then(([litData, casesData]) => {
      setProfiles(litData.profiles || [])
      setCases(casesData.cases || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const usedCaseIds = new Set(profiles.map(p => p.case_id))
  const availableCases = cases.filter(c => !usedCaseIds.has(c.id))

  // הגעה מעמוד לקוח/תיק עם ?case=<id>: אם כבר קיים תיק ליטיגציה — מעבר אליו;
  // אחרת פתיחת טופס הפתיחה כשהתיק מסומן מראש
  useEffect(() => {
    if (loading || !preselectCase) return
    const caseIdNum = Number(preselectCase)
    const existing = profiles.find(p => p.case_id === caseIdNum)
    if (existing) {
      window.location.href = `/admin/litigation/${existing.id}`
      return
    }
    setForm(f => ({ ...f, caseId: preselectCase }))
    setShowForm(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, preselectCase])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/admin/litigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה')
      window.location.href = `/admin/litigation/${data.id}`
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">ניהול ליטיגציה</h1>
          <p className="text-gray-500">ניהול הליכים משפטיים: טפסי פתיחה, הסכמי שכ"ט, חוות דעת וכתבי טענות</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setError('') }} className="btn-gold flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          תיק ליטיגציה חדש
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111] border border-gold-500/30 rounded-xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-2">פתיחת תיק ליטיגציה</h2>
          <p className="text-gray-500 text-sm mb-6">
            בחר תיק קיים מהמערכת. אם התיק עוד לא קיים —{' '}
            <Link href="/admin/cases" className="text-gold-400 hover:underline">פתח תחילה תיק חדש</Link>.
          </p>
          {error && (
            <div className="bg-red-900/20 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
          )}
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="label-dark">תיק *</label>
                <select required value={form.caseId} onChange={e => setForm({ ...form, caseId: e.target.value })} className="input-dark">
                  <option value="">בחר תיק...</option>
                  {availableCases.map(c => (
                    <option key={c.id} value={c.id}>{c.title} — {c.client_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-dark">הצד המיוצג *</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-dark">
                  <option value="plaintiff">תובע / מבקש</option>
                  <option value="defendant">נתבע / משיב</option>
                </select>
              </div>
              <div>
                <label className="label-dark">תחום משפטי *</label>
                <select value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} className="input-dark">
                  {LITIGATION_AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-gold disabled:opacity-60">
                {saving ? 'פותח...' : 'פתח תיק ליטיגציה'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline-gold">ביטול</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
          <h2 className="text-white font-bold">תיקי ליטיגציה</h2>
          <span className="text-gray-500 text-sm">{profiles.length} תיקים</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">טוען...</div>
        ) : profiles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">⚖️</div>
            <p className="text-gray-500 mb-2">אין תיקי ליטיגציה עדיין</p>
            <p className="text-gray-600 text-sm">פתח תיק ליטיגציה כדי להתחיל: טופס הכר את הלקוח, הסכם שכ"ט, חוו"ד וכתבי טענות</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {profiles.map(p => (
              <Link
                key={p.id}
                href={`/admin/litigation/${p.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#131313] transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`badge ${p.role === 'plaintiff' ? 'badge-active' : 'badge-open'}`}>
                      {ROLE_LABELS[p.role]}
                    </span>
                    <span className="text-gray-500 text-xs">{AREA_LABELS[p.area] || p.area}</span>
                    <span className="text-gray-500 text-xs">{p.client_name}</span>
                    {p.case_number && <span className="text-gray-700 text-xs">#{p.case_number}</span>}
                  </div>
                  <div className="text-white text-sm font-medium group-hover:text-gold-400 transition-colors">{p.case_title}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{p.doc_count} מסמכים שהופקו</div>
                </div>
                <div className="text-gray-600 text-xs text-left">
                  {new Date(p.updated_at || p.created_at).toLocaleDateString('he-IL')}
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

      {/* תיקים שממתינים לפתיחת ליטיגציה */}
      {!loading && availableCases.length > 0 && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold">תיקים שממתינים לפתיחת ליטיגציה</h2>
              <p className="text-gray-600 text-xs mt-0.5">תיקים קיימים שעדיין לא נפתח עבורם הליך ליטיגציה</p>
            </div>
            <span className="text-gray-500 text-sm">{availableCases.length} תיקים</span>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {availableCases.map(c => (
              <Link
                key={c.id}
                href={`/admin/litigation?case=${c.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#131313] transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-gray-500 text-xs">{c.client_name}</span>
                    {c.case_number && <span className="text-gray-700 text-xs">#{c.case_number}</span>}
                  </div>
                  <div className="text-white text-sm font-medium group-hover:text-gold-400 transition-colors">{c.title}</div>
                </div>
                <span className="btn-outline-gold text-sm px-4 py-2 group-hover:bg-gold-500 group-hover:text-black transition-colors">
                  פתח ליטיגציה
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LitigationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">טוען...</div>}>
      <LitigationContent />
    </Suspense>
  )
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AREA_LABELS } from '@/lib/legal-sources'
import { DOC_TYPES } from '@/lib/generators'
import {
  IntakeForm, FactsForm, OpposingClaimForm,
  FeeAgreementForm, OpinionForm, WarningLetterForm,
  ClaimForm, DefenseForm, MotionForm,
} from './forms'

const ROLE_LABELS = { plaintiff: 'ייצוג התובע', defendant: 'ייצוג הנתבע' }

const PLAINTIFF_TABS = [
  { key: 'intake', label: '1. הכר את הלקוח' },
  { key: 'facts', label: '2. תיאור המקרה' },
  { key: 'fee', label: '3. הסכם שכ"ט' },
  { key: 'opinion', label: '4. חוו"ד ראשונית' },
  { key: 'warning', label: '5. מכתב התרעה' },
  { key: 'claim', label: '6. כתב תביעה' },
  { key: 'motion', label: '7. בקשות וסעדים' },
  { key: 'docs', label: 'מסמכי התיק' },
]

const DEFENDANT_TABS = [
  { key: 'opposing', label: '1. כתב התביעה שהתקבל' },
  { key: 'intake', label: '2. הכר את הלקוח' },
  { key: 'fee', label: '3. הסכם שכ"ט' },
  { key: 'opinion', label: '4. חוו"ד ראשונית' },
  { key: 'defense', label: '5. כתב הגנה' },
  { key: 'motion', label: '6. בקשות וסעדים' },
  { key: 'docs', label: 'מסמכי התיק' },
]

export default function LitigationWorkspace() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(null)

  const fetchData = useCallback(() => {
    fetch(`/api/admin/litigation/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.profile) {
          setProfile(data.profile)
          setDocuments(data.documents || [])
          setTab(t => t || (data.profile.role === 'plaintiff' ? 'intake' : 'opposing'))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const deleteDoc = async (docId) => {
    if (!confirm('למחוק את המסמך? פעולה זו אינה הפיכה.')) return
    await fetch(`/api/admin/litigation/documents/${docId}`, { method: 'DELETE' })
    fetchData()
  }

  if (loading) return <div className="p-8 text-gray-500">טוען...</div>
  if (!profile) return (
    <div className="p-8">
      <p className="text-gray-500">תיק הליטיגציה לא נמצא.</p>
      <Link href="/admin/litigation" className="text-gold-400 hover:underline text-sm">חזרה לרשימה</Link>
    </div>
  )

  const tabs = profile.role === 'plaintiff' ? PLAINTIFF_TABS : DEFENDANT_TABS
  const onSaved = fetchData

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/litigation" className="text-gray-500 hover:text-gold-400 text-sm transition-colors">
          → כל תיקי הליטיגציה
        </Link>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <h1 className="text-2xl font-black text-white">{profile.case_title}</h1>
          <span className={`badge ${profile.role === 'plaintiff' ? 'badge-active' : 'badge-open'}`}>
            {ROLE_LABELS[profile.role]}
          </span>
          <span className="badge badge-open">{AREA_LABELS[profile.area] || profile.area}</span>
        </div>
        <div className="text-gray-500 text-sm mt-1 flex items-center gap-4 flex-wrap">
          <span>לקוח: {profile.client_name}</span>
          {profile.case_number && <span>מס' תיק: {profile.case_number}</span>}
          {profile.court && <span>ערכאה: {profile.court}</span>}
          <span>{documents.length} מסמכים הופקו</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-gold-500 text-black'
                : 'bg-[#111] border border-[#1e1e1e] text-gray-400 hover:border-gold-500/30 hover:text-white'
            }`}
          >
            {t.label}
            {t.key === 'docs' && documents.length > 0 && ` (${documents.length})`}
          </button>
        ))}
      </div>

      {tab === 'intake' && <IntakeForm profile={profile} onSaved={onSaved} />}
      {tab === 'facts' && <FactsForm profile={profile} onSaved={onSaved} />}
      {tab === 'opposing' && <OpposingClaimForm profile={profile} onSaved={onSaved} />}
      {tab === 'fee' && <FeeAgreementForm profile={profile} />}
      {tab === 'opinion' && <OpinionForm profile={profile} />}
      {tab === 'warning' && <WarningLetterForm profile={profile} />}
      {tab === 'claim' && <ClaimForm profile={profile} />}
      {tab === 'defense' && <DefenseForm profile={profile} />}
      {tab === 'motion' && <MotionForm profile={profile} />}

      {tab === 'docs' && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e1e1e]">
            <h2 className="text-white font-bold">מסמכים שהופקו בתיק</h2>
            <p className="text-gray-500 text-sm mt-0.5">כל מסמך נשמר עם המקורות המשפטיים עליהם נסמך</p>
          </div>
          {documents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-gray-500">טרם הופקו מסמכים בתיק זה</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1a1a1a]">
              {documents.map(d => {
                const sources = d.sources ? JSON.parse(d.sources) : []
                return (
                  <div key={d.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="badge badge-active">{DOC_TYPES[d.doc_type]?.label || d.doc_type}</span>
                        <span className="text-gray-600 text-xs">
                          {new Date(d.created_at).toLocaleString('he-IL')}
                        </span>
                      </div>
                      <div className="text-white text-sm font-medium">{d.title}</div>
                      <div className="text-gray-600 text-xs mt-0.5">{sources.length} מקורות משפטיים משובצים</div>
                    </div>
                    <a
                      href={`/admin/litigation/doc/${d.id}`} target="_blank" rel="noopener noreferrer"
                      className="btn-outline-gold text-sm px-4 py-2"
                    >
                      צפייה והדפסה
                    </a>
                    <button
                      onClick={() => deleteDoc(d.id)}
                      className="text-red-400/60 hover:text-red-400 transition-colors p-2"
                      title="מחיקת מסמך"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

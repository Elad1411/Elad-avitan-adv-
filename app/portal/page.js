'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const STATUS_MAP = {
  'פתוח': { cls: 'badge-open', dot: 'bg-blue-400' },
  'בטיפול': { cls: 'badge-active', dot: 'bg-gold-400' },
  'ממתין לדיון': { cls: 'badge-urgent', dot: 'bg-orange-400' },
  'סגור': { cls: 'badge-closed', dot: 'bg-green-400' },
  'זוכה': { cls: 'badge-closed', dot: 'bg-green-400' },
  'הורשע': { cls: 'badge-urgent', dot: 'bg-red-400' },
}

const AREA_LABELS = {
  criminal: 'פלילי',
  traffic: 'תעבורה',
  civil: 'אזרחי-מסחרי',
}

export default function PortalDashboard() {
  const { data: session } = useSession()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cases')
      .then(r => r.json())
      .then(data => { setCases(data.cases || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const activeCases = cases.filter(c => c.status !== 'סגור' && c.status !== 'זוכה' && c.status !== 'הורשע')
  const closedCases = cases.filter(c => c.status === 'סגור' || c.status === 'זוכה' || c.status === 'הורשע')

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          לוח בקרה
        </div>
        <h1 className="text-3xl font-black text-white mb-2">
          שלום, {session?.user?.name?.split(' ')[0] || 'לקוח'} 👋
        </h1>
        <p className="text-gray-500">ברוך הבא לפורטל הלקוחות של משרד עורכי הדין אלעד אביטן</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'סה"כ תיקים', value: cases.length, icon: '📁', color: 'text-blue-400' },
          { label: 'תיקים פעילים', value: activeCases.length, icon: '⚡', color: 'text-gold-400' },
          { label: 'תיקים סגורים', value: closedCases.length, icon: '✓', color: 'text-green-400' },
          {
            label: 'דיון הבא',
            value: cases.filter(c => c.next_hearing).length > 0
              ? new Date(cases.filter(c => c.next_hearing)[0].next_hearing).toLocaleDateString('he-IL')
              : '—',
            icon: '📅',
            color: 'text-purple-400',
          },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-2xl font-black mb-1 ${stat.color}`}>{loading ? '...' : stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Cases */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">התיקים שלי</h2>
          {cases.length > 0 && (
            <span className="text-gray-500 text-sm">{cases.length} תיקים</span>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-[#1e1e1e] rounded w-1/3 mb-3" />
                <div className="h-3 bg-[#1e1e1e] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-12 text-center">
            <div className="text-5xl mb-4">📂</div>
            <h3 className="text-xl font-bold text-white mb-2">אין תיקים עדיין</h3>
            <p className="text-gray-500 text-sm">כשיפתחו תיקים בשמך, הם יופיעו כאן</p>
            <a href="tel:054-4680810" className="inline-block mt-6 btn-gold text-sm py-2 px-5">
              פנה למשרד
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map(c => {
              const statusInfo = STATUS_MAP[c.status] || { cls: 'badge-open', dot: 'bg-gray-400' }
              return (
                <Link
                  key={c.id}
                  href={`/portal/case/${c.id}`}
                  className="block bg-[#111] border border-[#1e1e1e] rounded-xl p-6 hover:border-gold-500/30 transition-all duration-200 hover:bg-[#131313] group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`badge ${statusInfo.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} ml-1.5`} />
                          {c.status}
                        </span>
                        {c.area && (
                          <span className="text-xs text-gray-500 bg-[#1a1a1a] px-2 py-1 rounded">
                            {AREA_LABELS[c.area] || c.area}
                          </span>
                        )}
                        {c.case_number && (
                          <span className="text-xs text-gray-600">תיק מס&apos; {c.case_number}</span>
                        )}
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2 group-hover:text-gold-400 transition-colors">
                        {c.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {c.court && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                            </svg>
                            {c.court}
                          </span>
                        )}
                        {c.next_hearing && (
                          <span className="flex items-center gap-1 text-gold-500/70">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            דיון: {new Date(c.next_hearing).toLocaleDateString('he-IL')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          נפתח: {new Date(c.created_at).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-600 group-hover:text-gold-500 transition-colors flex-shrink-0">
                      <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Contact box */}
      <div className="bg-gradient-to-l from-gold-500/5 to-transparent border border-gold-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-white font-bold mb-1">צריך עזרה?</h3>
            <p className="text-gray-500 text-sm">המשרד זמין עבורך לכל שאלה</p>
          </div>
          <div className="flex gap-3">
            <a href="tel:054-4680810" className="btn-gold text-sm py-2.5 px-5">
              054-4680810
            </a>
            <a href="mailto:office@eladavitan-law.co.il" className="btn-outline-gold text-sm py-2.5 px-5">
              שלח מייל
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

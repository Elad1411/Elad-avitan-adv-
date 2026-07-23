'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const STATUS_MAP = {
  'פתוח': 'badge-open', 'בטיפול': 'badge-active',
  'ממתין לדיון': 'badge-urgent', 'סגור': 'badge-closed',
  'זוכה': 'badge-closed', 'הורשע': 'badge-urgent',
}

export default function ClientDetailPage() {
  const { id } = useParams()
  const [client, setClient] = useState(null)
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/clients/${id}`)
      .then(r => r.json())
      .then(data => {
        setClient(data.client || null)
        setCases(data.cases || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-8">
        <p className="text-gray-500 mb-2">הלקוח לא נמצא.</p>
        <Link href="/admin/clients" className="text-gold-400 hover:underline text-sm">חזרה לרשימת הלקוחות</Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-gold-400 transition-colors">ניהול</Link>
        <span>/</span>
        <Link href="/admin/clients" className="hover:text-gold-400 transition-colors">לקוחות</Link>
        <span>/</span>
        <span className="text-gray-300">{client.name}</span>
      </div>

      {/* Client header */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 mb-6 flex items-start gap-4">
        <div className="w-14 h-14 bg-gold-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-gold-400 font-bold text-xl">{client.name[0]}</span>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white mb-1">{client.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
            <span dir="ltr">שם משתמש: {client.username}</span>
            {client.email && <span dir="ltr">{client.email}</span>}
            {client.phone && <span>{client.phone}</span>}
            <span>לקוח מאז {new Date(client.created_at).toLocaleDateString('he-IL')}</span>
          </div>
        </div>
        <Link
          href={`/admin/cases?client=${client.id}`}
          className="btn-gold flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          פתח תיק חדש
        </Link>
      </div>

      {/* Cases */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
          <h2 className="text-white font-bold">תיקי הלקוח</h2>
          <span className="text-gray-500 text-sm">{cases.length} תיקים</span>
        </div>

        {cases.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📁</div>
            <p className="text-gray-500 mb-4">אין תיקים ללקוח זה עדיין</p>
            <Link href={`/admin/cases?client=${client.id}`} className="btn-gold text-sm py-2 px-5">
              פתח תיק ראשון ללקוח
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {cases.map(c => (
              <div key={c.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#131313] transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`badge ${STATUS_MAP[c.status] || 'badge-open'}`}>{c.status}</span>
                    {c.case_number && <span className="text-gray-700 text-xs">#{c.case_number}</span>}
                    <span className="text-gray-600 text-xs">{c.file_count || 0} מסמכים</span>
                  </div>
                  <div className="text-white text-sm font-medium">{c.title}</div>
                  {c.next_hearing && (
                    <div className="text-xs text-gold-500/60 mt-0.5">
                      דיון: {new Date(c.next_hearing).toLocaleDateString('he-IL')}
                    </div>
                  )}
                </div>
                {c.litigation_id ? (
                  <Link href={`/admin/litigation/${c.litigation_id}`} className="btn-outline-gold text-sm px-3 py-2">
                    ליטיגציה
                  </Link>
                ) : (
                  <Link href="/admin/litigation" className="text-gray-500 hover:text-gold-400 text-sm px-3 py-2 transition-colors">
                    + ליטיגציה
                  </Link>
                )}
                <Link href={`/admin/case/${c.id}`} className="btn-gold text-sm px-4 py-2">
                  נהל תיק ומסמכים
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

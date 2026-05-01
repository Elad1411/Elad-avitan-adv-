'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ clients: 0, cases: 0, activeCases: 0, files: 0 })
  const [recentCases, setRecentCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/cases?limit=5').then(r => r.json()),
    ]).then(([statsData, casesData]) => {
      setStats(statsData)
      setRecentCases(casesData.cases || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const STATUS_MAP = {
    'פתוח': 'badge-open',
    'בטיפול': 'badge-active',
    'ממתין לדיון': 'badge-urgent',
    'סגור': 'badge-closed',
    'זוכה': 'badge-closed',
    'הורשע': 'badge-urgent',
  }

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2">לוח ניהול</h1>
        <p className="text-gray-500">ברוך הבא לפאנל הניהול של משרד עורכי הדין</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'לקוחות', value: stats.clients, icon: '👥', color: 'text-blue-400', href: '/admin/clients' },
          { label: 'סה"כ תיקים', value: stats.cases, icon: '📁', color: 'text-gold-400', href: '/admin/cases' },
          { label: 'תיקים פעילים', value: stats.activeCases, icon: '⚡', color: 'text-orange-400', href: '/admin/cases' },
          { label: 'קבצים', value: stats.files, icon: '📄', color: 'text-green-400', href: '/admin/cases' },
        ].map((stat, i) => (
          <Link key={i} href={stat.href} className="block bg-[#111] border border-[#1e1e1e] rounded-xl p-5 hover:border-gold-500/30 transition-all">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-3xl font-black mb-1 ${stat.color}`}>{loading ? '...' : stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          {
            href: '/admin/clients',
            title: 'הוסף לקוח חדש',
            desc: 'צור חשבון לקוח עם שם משתמש וסיסמה',
            icon: '➕',
          },
          {
            href: '/admin/cases',
            title: 'פתח תיק חדש',
            desc: 'פתח תיק עבור לקוח קיים',
            icon: '📂',
          },
          {
            href: '/admin/cases',
            title: 'עדכן סטטוס תיק',
            desc: 'הוסף עדכונים ומסמכים לתיקים',
            icon: '✏️',
          },
        ].map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 hover:border-gold-500/30 hover:bg-[#131313] transition-all group"
          >
            <div className="text-3xl mb-3">{action.icon}</div>
            <div className="text-white font-bold mb-1 group-hover:text-gold-400 transition-colors">{action.title}</div>
            <div className="text-gray-500 text-sm">{action.desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent Cases */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">תיקים אחרונים</h2>
          <Link href="/admin/cases" className="text-gold-500 hover:text-gold-400 text-sm transition-colors">
            כל התיקים →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-[#1e1e1e] rounded w-1/3 mb-2" />
                <div className="h-3 bg-[#1e1e1e] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : recentCases.length === 0 ? (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-8 text-center">
            <p className="text-gray-500">אין תיקים עדיין</p>
            <Link href="/admin/cases" className="inline-block mt-4 btn-gold text-sm py-2 px-4">
              פתח תיק ראשון
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentCases.map(c => (
              <Link
                key={c.id}
                href={`/admin/case/${c.id}`}
                className="flex items-center gap-4 bg-[#111] border border-[#1e1e1e] rounded-xl p-4 hover:border-gold-500/30 hover:bg-[#131313] transition-all group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${STATUS_MAP[c.status] || 'badge-open'}`}>{c.status}</span>
                    <span className="text-gray-600 text-xs">{c.client_name}</span>
                  </div>
                  <div className="text-white font-medium text-sm group-hover:text-gold-400 transition-colors">{c.title}</div>
                </div>
                <div className="text-gray-600 text-xs">
                  {new Date(c.updated_at || c.created_at).toLocaleDateString('he-IL')}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

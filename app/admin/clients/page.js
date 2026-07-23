'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    username: '', password: '', name: '', email: '', phone: '',
  })

  const fetchClients = () => {
    fetch('/api/admin/clients')
      .then(r => r.json())
      .then(data => { setClients(data.clients || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchClients() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה')
      setSuccess(`לקוח "${form.name}" נוצר בהצלחה!`)
      setForm({ username: '', password: '', name: '', email: '', phone: '' })
      setShowForm(false)
      fetchClients()
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`למחוק את הלקוח "${name}"? פעולה זו תמחק גם את כל התיקים הקשורים.`)) return
    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('שגיאה במחיקה')
      setSuccess(`הלקוח "${name}" נמחק`)
      fetchClients()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">ניהול לקוחות</h1>
          <p className="text-gray-500">הוסף ונהל לקוחות ופרטי הכניסה שלהם</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError('') }}
          className="btn-gold flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          לקוח חדש
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

      {/* New Client Form */}
      {showForm && (
        <div className="bg-[#111] border border-gold-500/30 rounded-xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-6">פרטי לקוח חדש</h2>
          {error && (
            <div className="bg-red-900/20 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label-dark">שם מלא *</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-dark" placeholder="ישראל ישראלי"
                />
              </div>
              <div>
                <label className="label-dark">טלפון</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="input-dark" placeholder="050-0000000"
                />
              </div>
              <div>
                <label className="label-dark">שם משתמש *</label>
                <input
                  type="text" required
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="input-dark" placeholder="israel123"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="label-dark">סיסמה *</label>
                <input
                  type="text" required minLength={6}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-dark" placeholder="לפחות 6 תווים"
                  dir="ltr"
                />
              </div>
              <div className="col-span-2">
                <label className="label-dark">אי-מייל</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-dark" placeholder="israel@example.com"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-gold disabled:opacity-60">
                {saving ? 'שומר...' : 'צור לקוח'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline-gold">
                ביטול
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clients Table */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
          <h2 className="text-white font-bold">כל הלקוחות</h2>
          <span className="text-gray-500 text-sm">{clients.length} לקוחות</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">טוען...</div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-gray-500 mb-4">אין לקוחות עדיין</p>
            <button onClick={() => setShowForm(true)} className="btn-gold text-sm py-2 px-5">
              הוסף לקוח ראשון
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {clients.map(client => (
              <div key={client.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#131313] transition-colors">
                <Link href={`/admin/clients/${client.id}`} className="flex items-center gap-4 flex-1 min-w-0 group">
                  <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-gold-400 font-bold text-sm">{client.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium group-hover:text-gold-400 transition-colors">{client.name}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                      <span dir="ltr">{client.username}</span>
                      {client.email && <span dir="ltr">{client.email}</span>}
                      {client.phone && <span>{client.phone}</span>}
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{client.case_count || 0} תיקים</span>
                  <span className="text-gray-700">|</span>
                  <span>{new Date(client.created_at).toLocaleDateString('he-IL')}</span>
                </div>
                <Link
                  href={`/admin/clients/${client.id}`}
                  className="btn-outline-gold text-sm px-4 py-2"
                >
                  נהל תיקים
                </Link>
                <button
                  onClick={() => handleDelete(client.id, client.name)}
                  className="text-red-400/50 hover:text-red-400 transition-colors p-2 hover:bg-red-900/10 rounded-lg"
                  title="מחק לקוח"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError('')
    if (form.newPassword !== form.confirmPassword) {
      setError('הסיסמאות אינן תואמות')
      return
    }
    if (form.newPassword.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה')
      setSaved(true)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSaved(false), 4000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          הפרופיל שלי
        </div>
        <h1 className="text-3xl font-black text-white mb-2">פרטי חשבון</h1>
      </div>

      {/* User Info */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gold-500/20 border border-gold-500/30 rounded-2xl flex items-center justify-center">
            <span className="text-gold-400 font-black text-2xl">
              {session?.user?.name?.[0] || 'ל'}
            </span>
          </div>
          <div>
            <div className="text-white font-bold text-xl">{session?.user?.name}</div>
            <div className="text-gray-500 text-sm">לקוח פעיל</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-[#0d0d0d] rounded-lg p-4">
            <div className="text-gray-600 mb-1">שם משתמש</div>
            <div className="text-gray-300 font-medium" dir="ltr">{session?.user?.username}</div>
          </div>
          {session?.user?.email && (
            <div className="bg-[#0d0d0d] rounded-lg p-4">
              <div className="text-gray-600 mb-1">אי-מייל</div>
              <div className="text-gray-300 font-medium" dir="ltr">{session?.user?.email}</div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
        <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          שינוי סיסמה
        </h2>

        {error && (
          <div className="bg-red-900/20 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {saved && (
          <div className="bg-green-900/20 border border-green-800/50 text-green-300 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            הסיסמה שונתה בהצלחה!
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'סיסמה נוכחית', placeholder: '••••••••' },
            { key: 'newPassword', label: 'סיסמה חדשה', placeholder: 'לפחות 6 תווים' },
            { key: 'confirmPassword', label: 'אימות סיסמה חדשה', placeholder: '••••••••' },
          ].map(field => (
            <div key={field.key}>
              <label className="label-dark">{field.label}</label>
              <input
                type="password"
                value={form[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                className="input-dark"
                placeholder={field.placeholder}
                dir="ltr"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="btn-gold py-3 px-8 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'שומר...' : 'עדכן סיסמה'}
          </button>
        </form>
      </div>

      <div className="mt-6 p-4 bg-gold-500/5 border border-gold-500/20 rounded-xl text-sm text-gray-500">
        <p>לשינוי פרטים אישיים נוספים, אנא צור קשר עם המשרד:</p>
        <a href="tel:054-4680810" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
          054-4680810
        </a>
      </div>
    </div>
  )
}

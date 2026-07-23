'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      username: credentials.username,
      password: credentials.password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('שם משתמש או סיסמה שגויים')
    } else if (callbackUrl) {
      router.push(callbackUrl)
    } else {
      // ללא יעד מפורש — הפניה לפי סוג המשתמש: מנהל לפאנל הניהול, לקוח לפורטל
      const session = await getSession()
      router.push(session?.user?.role === 'admin' ? '/admin' : '/portal')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-[#111]">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <div>
            <div className="text-gold-500 font-black text-lg leading-tight">עו&quot;ד אלעד אביטן</div>
            <div className="text-gray-600 text-xs">חזרה לאתר</div>
          </div>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">פורטל לקוחות</h1>
            <p className="text-gray-500 text-sm">
              התחבר לצפייה במצב התיק ולניהול מסמכים
            </p>
          </div>

          {/* Form */}
          <div className="bg-[#111] border border-[#222] rounded-2xl p-8">
            {error && (
              <div className="bg-red-900/20 border border-red-800/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-dark">שם משתמש</label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={credentials.username}
                  onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                  className="input-dark"
                  placeholder="הכנס שם משתמש"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="label-dark">סיסמה</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={credentials.password}
                    onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                    className="input-dark pl-10"
                    placeholder="הכנס סיסמה"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    מתחבר...
                  </span>
                ) : 'כניסה לפורטל'}
              </button>
            </form>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              נתקלת בבעיה?{' '}
              <a href="tel:054-4680810" className="text-gold-500 hover:text-gold-400 transition-colors">
                צור קשר עם המשרד
              </a>
            </p>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-gray-700 text-xs border-t border-[#111]">
        © {new Date().getFullYear()} עו&quot;ד אלעד אביטן | כל הזכויות שמורות
      </footer>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="text-gray-500">טוען...</div></div>}>
      <LoginForm />
    </Suspense>
  )
}

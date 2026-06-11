'use client'

import { useState, useRef, useEffect } from 'react'
import TermsContent from './TermsContent'
import { TERMS_CONSENT_LABEL } from '@/lib/terms'

/**
 * שער התקנון לטופס יצירת הקשר.
 * אוכף שלא ניתן לתת הסכמה ללא פתיחה יזומה של התקנון (פתיחת החלון מתועדת בשרת),
 * עיון בו (גלילה עד הסוף) ואישור מפורש.
 *
 * props:
 *   consented   - בוליאני: האם הגולש כבר אישר.
 *   token       - אסימון התיעוד שהתקבל מהשרת (מצורף לשליחת הטופס).
 *   onConsent   - callback(token) לאחר אישור מתועד.
 *   onRevoke    - callback() לביטול ההסכמה (למשל בעת איפוס הטופס).
 */
export default function TermsGate({ consented, token, onConsent, onRevoke }) {
  const [open, setOpen] = useState(false)
  const [scrolledToEnd, setScrolledToEnd] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const localToken = useRef(token || null)
  const scrollRef = useRef(null)

  // פתיחה יזומה של התקנון — מייצר תיעוד צפייה בשרת.
  const openTerms = async () => {
    setError('')
    setScrolledToEnd(false)
    setOpen(true)
    if (!localToken.current) {
      try {
        const res = await fetch('/api/terms/view', { method: 'POST' })
        const data = await res.json()
        if (data.token) localToken.current = data.token
      } catch {
        setError('אירעה שגיאה בטעינת התקנון. נסו שנית.')
      }
    }
  }

  // זיהוי גלילה עד תחתית התקנון — תנאי לעיון בפועל.
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setScrolledToEnd(true)
    }
  }

  // אם התוכן קצר מגובה החלון, אין מה לגלול — נאפשר אישור מיד.
  useEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (el && el.scrollHeight <= el.clientHeight + 24) setScrolledToEnd(true)
  }, [open])

  const acknowledge = async () => {
    if (!localToken.current) {
      setError('לא נוצר תיעוד צפייה. נסו לפתוח את התקנון מחדש.')
      return
    }
    setWorking(true)
    setError('')
    try {
      const res = await fetch('/api/terms/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: localToken.current }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'אישור התקנון נכשל')
      }
      onConsent(localToken.current)
      setOpen(false)
    } catch (e) {
      setError(e.message || 'אישור התקנון נכשל. נסו שנית.')
    } finally {
      setWorking(false)
    }
  }

  // לחיצה על תיבת הסימון לא מאשרת ישירות — היא פותחת את התקנון לעיון יזום,
  // או מבטלת הסכמה קיימת. כך לא ניתן לאשר ללא פתיחת התקנון.
  const handleCheckboxClick = (e) => {
    e.preventDefault()
    if (consented) {
      localToken.current = null
      onRevoke()
    } else {
      openTerms()
    }
  }

  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={!!consented}
          onChange={() => {}}
          onClick={handleCheckboxClick}
          className="mt-1 w-5 h-5 accent-gold-500 cursor-pointer flex-shrink-0"
          aria-describedby="terms-help"
        />
        <span className="text-gray-400 text-sm leading-relaxed">
          {TERMS_CONSENT_LABEL}{' '}
          <button
            type="button"
            onClick={openTerms}
            className="text-gold-400 hover:text-gold-300 underline font-medium"
          >
            לצפייה בתקנון
          </button>
        </span>
      </label>
      {!consented && (
        <p id="terms-help" className="text-gray-600 text-xs mt-2 pr-8">
          לא ניתן לשלוח את הטופס ללא פתיחת התקנון ואישורו.
        </p>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          dir="rtl"
          role="dialog"
          aria-modal="true"
        >
          <div className="card-dark w-full max-w-2xl max-h-[85vh] flex flex-col border-gold-500/30">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="overflow-y-auto p-6 md:p-8 flex-1"
            >
              <TermsContent />
            </div>

            <div className="border-t border-[#222] p-5 space-y-3 bg-[#0d0d0d] rounded-b-xl">
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              {!scrolledToEnd && (
                <p className="text-gray-500 text-xs text-center">
                  יש לגלול עד סוף התקנון כדי לאשר את קריאתו.
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={acknowledge}
                  disabled={!scrolledToEnd || working}
                  className="btn-gold flex-1 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {working ? 'מאשר...' : 'קראתי ואני מאשר את התקנון'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-outline-gold flex-1 py-3"
                >
                  סגירה
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { SOURCE_TYPE_LABELS } from '@/lib/legal-sources'
import { MOTION_TYPES } from '@/lib/generators'

/* ===== רכיבי עזר ===== */

export function Field({ label, span = 1, children, hint }) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="label-dark">{label}</label>
      {children}
      {hint && <p className="text-gray-600 text-xs mt-1">{hint}</p>}
    </div>
  )
}

function Notice({ kind, children }) {
  const cls = kind === 'error'
    ? 'bg-red-900/20 border-red-800/50 text-red-300'
    : 'bg-green-900/20 border-green-800/50 text-green-300'
  return <div className={`border text-sm px-4 py-3 rounded-lg mb-4 ${cls}`}>{children}</div>
}

function SaveBar({ saving, label = 'שמירה', savingLabel = 'שומר...' }) {
  return (
    <button type="submit" disabled={saving} className="btn-gold disabled:opacity-60 mt-2">
      {saving ? savingLabel : label}
    </button>
  )
}

function useForm(initial) {
  const [form, setForm] = useState(initial)
  const set = (k) => (e) => {
    const v = e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e
    setForm(f => ({ ...f, [k]: v }))
  }
  return [form, set, setForm]
}

async function saveProfile(profileId, body) {
  const res = await fetch(`/api/admin/litigation/${profileId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'שגיאה בשמירה')
}

async function generateDoc(profileId, docType, data, sourceIds) {
  const res = await fetch(`/api/admin/litigation/${profileId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docType, data, sourceIds }),
  })
  const out = await res.json()
  if (!res.ok) throw new Error(out.error || 'שגיאה ביצירת המסמך')
  return out.docId
}

/* ===== בוחר מקורות משפטיים (חובה: לפחות 3) ===== */

export function SourcePicker({ area, docType, selected, onChange }) {
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/admin/legal-sources?area=${area}&docType=${docType || ''}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        setSources(data.sources || [])
        if (!selected.length && data.suggested?.length) {
          onChange(data.suggested.filter(id => (data.sources || []).some(s => s.id === id)))
        }
        setLoading(false)
      })
      .catch(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, docType])

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])
  }

  const ok = selected.length >= 3

  return (
    <div className="col-span-2 border border-[#252525] rounded-xl p-4 bg-[#0d0d0d]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-white font-bold text-sm">מקורות משפטיים למסמך</div>
          <div className="text-gray-600 text-xs mt-0.5">
            כל מסמך חייב להישען על לפחות 3 מקורות מהספרייה — חקיקה ופסיקה אמיתית עם מראה מקום וקישור
          </div>
        </div>
        <span className={`badge ${ok ? 'badge-closed' : 'badge-urgent'}`}>
          {selected.length} / 3 לפחות
        </span>
      </div>
      {loading ? (
        <div className="text-gray-500 text-sm py-4 text-center">טוען מקורות...</div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pl-1">
          {sources.map(s => (
            <label
              key={s.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                selected.includes(s.id)
                  ? 'border-gold-500/40 bg-gold-500/5'
                  : 'border-[#1e1e1e] hover:border-[#333]'
              }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(s.id)}
                onChange={() => toggle(s.id)}
                className="mt-1 accent-yellow-500"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white text-sm font-medium">{s.name}</span>
                  <span className="badge badge-open">{SOURCE_TYPE_LABELS[s.type] || s.type}</span>
                </div>
                <div className="text-gray-500 text-xs mt-0.5">{s.citation} — {s.note}</div>
                <a
                  href={s.link} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-gold-500/80 hover:text-gold-400 text-xs underline"
                >
                  {s.searchHint || 'צפייה במקור'}
                </a>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

/* ===== מעטפת טופס מחולל ===== */

function GeneratorForm({
  profile, docType, title, description, buildData, valid = () => true, children,
  sourceIds: sourceIdsProp, setSourceIds: setSourceIdsProp, headerExtra,
}) {
  const [internalSourceIds, setInternalSourceIds] = useState([])
  const sourceIds = sourceIdsProp ?? internalSourceIds
  const setSourceIds = setSourceIdsProp ?? setInternalSourceIds
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (sourceIds.length < 3) {
      setError('יש לבחור לפחות 3 מקורות משפטיים לפני יצירת המסמך')
      return
    }
    const check = valid()
    if (check !== true) { setError(check); return }
    setSaving(true)
    try {
      const docId = await generateDoc(profile.id, docType, buildData(), sourceIds)
      setSuccess('המסמך נוצר בהצלחה ונשמר בתיק')
      window.open(`/admin/litigation/doc/${docId}`, '_blank')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
      <h2 className="text-white font-bold text-lg mb-1">{title}</h2>
      {description && <p className="text-gray-500 text-sm mb-5">{description}</p>}
      {headerExtra}
      {error && <Notice kind="error">{error}</Notice>}
      {success && <Notice kind="success">{success}</Notice>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {children}
          <SourcePicker area={profile.area} docType={docType} selected={sourceIds} onChange={setSourceIds} />
        </div>
        <SaveBar saving={saving} label="צור מסמך + שמור בתיק" savingLabel="מייצר מסמך..." />
      </form>
    </div>
  )
}

/* ===== 1. טופס הכר את הלקוח ===== */

export function IntakeForm({ profile, onSaved }) {
  const initial = profile.intake ? JSON.parse(profile.intake) : {}
  const [form, set] = useForm({
    fullName: initial.fullName || profile.client_name || '',
    idNumber: initial.idNumber || '', birthDate: initial.birthDate || '',
    address: initial.address || '', phone: initial.phone || profile.client_phone || '',
    email: initial.email || profile.client_email || '', occupation: initial.occupation || '',
    maritalStatus: initial.maritalStatus || '', referralSource: initial.referralSource || '',
    previousProceedings: initial.previousProceedings || '',
    opposingName: initial.opposingName || '', opposingId: initial.opposingId || '',
    opposingAddress: initial.opposingAddress || '', opposingCounsel: initial.opposingCounsel || '',
    conflictCheck: initial.conflictCheck || '', clientGoals: initial.clientGoals || '',
    budget: initial.budget || '', docsProvided: initial.docsProvided || '', notes: initial.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setSaving(true)
    try {
      await saveProfile(profile.id, { intake: form })
      setSuccess('טופס הכר את הלקוח נשמר')
      onSaved?.()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
      <h2 className="text-white font-bold text-lg mb-1">טופס הכר את הלקוח</h2>
      <p className="text-gray-500 text-sm mb-5">
        זיהוי הלקוח ובדיקת ניגוד עניינים — בהתאם לחובות לפי כללי לשכת עורכי הדין (אתיקה מקצועית), תשמ"ו-1986
      </p>
      {error && <Notice kind="error">{error}</Notice>}
      {success && <Notice kind="success">{success}</Notice>}
      <form onSubmit={handleSubmit}>
        <div className="text-gold-400/80 text-xs font-bold mb-2">פרטי הלקוח</div>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <Field label="שם מלא *"><input required type="text" value={form.fullName} onChange={set('fullName')} className="input-dark" /></Field>
          <Field label="ת&quot;ז / ח&quot;פ *"><input required type="text" value={form.idNumber} onChange={set('idNumber')} className="input-dark" dir="ltr" /></Field>
          <Field label="תאריך לידה / התאגדות"><input type="date" value={form.birthDate} onChange={set('birthDate')} className="input-dark" dir="ltr" /></Field>
          <Field label="מצב משפחתי">
            <select value={form.maritalStatus} onChange={set('maritalStatus')} className="input-dark">
              <option value="">בחר...</option>
              {['רווק/ה', 'נשוי/אה', 'גרוש/ה', 'אלמן/ה', 'ידועים בציבור', 'תאגיד'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="כתובת" span={2}><input type="text" value={form.address} onChange={set('address')} className="input-dark" /></Field>
          <Field label="טלפון"><input type="tel" value={form.phone} onChange={set('phone')} className="input-dark" dir="ltr" /></Field>
          <Field label="דוא&quot;ל"><input type="email" value={form.email} onChange={set('email')} className="input-dark" dir="ltr" /></Field>
          <Field label="עיסוק"><input type="text" value={form.occupation} onChange={set('occupation')} className="input-dark" /></Field>
          <Field label="כיצד הגיע למשרד"><input type="text" value={form.referralSource} onChange={set('referralSource')} className="input-dark" /></Field>
          <Field label="הליכים קודמים באותו עניין" span={2} hint="ייצוג קודם, הליכים תלויים ועומדים, פסקי דין קודמים">
            <textarea rows={2} value={form.previousProceedings} onChange={set('previousProceedings')} className="input-dark resize-none" />
          </Field>
        </div>

        <div className="text-gold-400/80 text-xs font-bold mb-2">הצד שכנגד</div>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <Field label="שם הצד שכנגד"><input type="text" value={form.opposingName} onChange={set('opposingName')} className="input-dark" /></Field>
          <Field label="ת&quot;ז / ח&quot;פ"><input type="text" value={form.opposingId} onChange={set('opposingId')} className="input-dark" dir="ltr" /></Field>
          <Field label="כתובת"><input type="text" value={form.opposingAddress} onChange={set('opposingAddress')} className="input-dark" /></Field>
          <Field label="בא כוחו (אם ידוע)"><input type="text" value={form.opposingCounsel} onChange={set('opposingCounsel')} className="input-dark" /></Field>
          <Field label="בדיקת ניגוד עניינים *" span={2} hint="האם המשרד ייצג בעבר את הצד שכנגד או גורם קשור? פרט את הבדיקה שנערכה">
            <textarea required rows={2} value={form.conflictCheck} onChange={set('conflictCheck')} className="input-dark resize-none" />
          </Field>
        </div>

        <div className="text-gold-400/80 text-xs font-bold mb-2">מטרות ומסמכים</div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="מטרות הלקוח וציפיותיו" span={2}>
            <textarea rows={2} value={form.clientGoals} onChange={set('clientGoals')} className="input-dark resize-none" />
          </Field>
          <Field label="מסגרת תקציב"><input type="text" value={form.budget} onChange={set('budget')} className="input-dark" /></Field>
          <Field label="מסמכים שנמסרו"><textarea rows={2} value={form.docsProvided} onChange={set('docsProvided')} className="input-dark resize-none" /></Field>
          <Field label="הערות" span={2}><textarea rows={2} value={form.notes} onChange={set('notes')} className="input-dark resize-none" /></Field>
        </div>
        <SaveBar saving={saving} label="שמור טופס" />
      </form>
    </div>
  )
}

/* ===== 2. טופס תיאור המקרה והעובדות ===== */

export function FactsForm({ profile, onSaved }) {
  const initial = profile.facts ? JSON.parse(profile.facts) : {}
  const [form, set] = useForm({
    eventDate: initial.eventDate || '', eventPlace: initial.eventPlace || '',
    chronology: initial.chronology || '', involved: initial.involved || '',
    witnesses: initial.witnesses || '', damages: initial.damages || '',
    damageAmount: initial.damageAmount || '', evidence: initial.evidence || '',
    actionsTaken: initial.actionsTaken || '', criticalDates: initial.criticalDates || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setSaving(true)
    try {
      await saveProfile(profile.id, { facts: form })
      setSuccess('תיאור המקרה נשמר')
      onSaved?.()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
      <h2 className="text-white font-bold text-lg mb-1">תיאור המקרה והעובדות</h2>
      <p className="text-gray-500 text-sm mb-5">העובדות כפי שנמסרו מהלקוח — הבסיס לחוות הדעת ולכתבי הטענות</p>
      {error && <Notice kind="error">{error}</Notice>}
      {success && <Notice kind="success">{success}</Notice>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="תאריך האירוע המרכזי"><input type="date" value={form.eventDate} onChange={set('eventDate')} className="input-dark" dir="ltr" /></Field>
          <Field label="מקום האירוע"><input type="text" value={form.eventPlace} onChange={set('eventPlace')} className="input-dark" /></Field>
          <Field label="תיאור כרונולוגי של האירועים *" span={2} hint="פרט את השתלשלות האירועים לפי סדר זמנים — כל שורה תהפוך לסעיף עובדתי">
            <textarea required rows={6} value={form.chronology} onChange={set('chronology')} className="input-dark resize-none" />
          </Field>
          <Field label="גורמים מעורבים"><textarea rows={2} value={form.involved} onChange={set('involved')} className="input-dark resize-none" /></Field>
          <Field label="עדים אפשריים"><textarea rows={2} value={form.witnesses} onChange={set('witnesses')} className="input-dark resize-none" /></Field>
          <Field label="הנזקים שנגרמו"><textarea rows={2} value={form.damages} onChange={set('damages')} className="input-dark resize-none" /></Field>
          <Field label="אומדן הנזק (₪)"><input type="number" value={form.damageAmount} onChange={set('damageAmount')} className="input-dark" dir="ltr" /></Field>
          <Field label="ראיות ומסמכים קיימים" span={2}><textarea rows={2} value={form.evidence} onChange={set('evidence')} className="input-dark resize-none" /></Field>
          <Field label="פעולות שנעשו עד כה"><textarea rows={2} value={form.actionsTaken} onChange={set('actionsTaken')} className="input-dark resize-none" /></Field>
          <Field label="מועדים קריטיים" hint="התיישנות, מועדי הגשה, מועדים חוזיים">
            <textarea rows={2} value={form.criticalDates} onChange={set('criticalDates')} className="input-dark resize-none" />
          </Field>
        </div>
        <SaveBar saving={saving} label="שמור תיאור מקרה" />
      </form>
    </div>
  )
}

/* ===== 3. הזנת כתב תביעה שהתקבל (ייצוג נתבע) ===== */

export function OpposingClaimForm({ profile, onSaved }) {
  const [text, setText] = useState(profile.opposing_claim || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setSaving(true)
    try {
      await saveProfile(profile.id, { opposingClaim: text })
      setSuccess('כתב התביעה נשמר בתיק')
      onSaved?.()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
      <h2 className="text-white font-bold text-lg mb-1">כתב התביעה שהתקבל</h2>
      <p className="text-gray-500 text-sm mb-5">
        הדבק את נוסח כתב התביעה שהוגש נגד הלקוח — ישמש בסיס לניתוח ולהכנת כתב ההגנה
      </p>
      {error && <Notice kind="error">{error}</Notice>}
      {success && <Notice kind="success">{success}</Notice>}
      <form onSubmit={handleSubmit}>
        <textarea
          rows={16} value={text} onChange={e => setText(e.target.value)}
          className="input-dark resize-y font-mono text-xs leading-relaxed"
          placeholder="הדבק כאן את נוסח כתב התביעה במלואו, כולל סעיפים ממוספרים..."
        />
        <SaveBar saving={saving} label="שמור כתב תביעה" />
      </form>
    </div>
  )
}

/* ===== 4. מחולל הסכם שכר טרחה ===== */

export function FeeAgreementForm({ profile }) {
  const [form, set] = useForm({
    scope: profile.case_title || '', feeType: 'fixed', feeAmount: '', feePercent: '',
    paymentTerms: '', extraTerms: '', officeAddress: '', officePhone: '',
  })
  return (
    <GeneratorForm
      profile={profile} docType="fee_agreement" title='מחולל הסכם שכר טרחה'
      description='הסכם שכ"ט בכתב, בהתאם לחוק לשכת עורכי הדין ולכללי האתיקה'
      buildData={() => form}
      valid={() => {
        if (!form.scope.trim()) return 'יש למלא את מהות הייצוג'
        if (form.feeType !== 'contingency' && !form.feeAmount) return 'יש למלא סכום שכר טרחה'
        if ((form.feeType === 'contingency' || form.feeType === 'mixed') && !form.feePercent) return 'יש למלא אחוז שכר טרחה'
        return true
      }}
    >
      <Field label="מהות הייצוג *" span={2} hint="תיאור ההליך והשירות המשפטי נשוא ההסכם">
        <textarea required rows={3} value={form.scope} onChange={set('scope')} className="input-dark resize-none" />
      </Field>
      <Field label="מבנה שכר הטרחה *">
        <select value={form.feeType} onChange={set('feeType')} className="input-dark">
          <option value="fixed">קבוע (גלובלי)</option>
          <option value="hourly">לפי שעות</option>
          <option value="contingency">אחוזים מהתוצאה</option>
          <option value="mixed">משולב (מקדמה + אחוזים)</option>
        </select>
      </Field>
      {form.feeType !== 'contingency' && (
        <Field label={form.feeType === 'hourly' ? 'תעריף לשעה (₪) *' : 'סכום (₪) *'}>
          <input type="number" value={form.feeAmount} onChange={set('feeAmount')} className="input-dark" dir="ltr" />
        </Field>
      )}
      {(form.feeType === 'contingency' || form.feeType === 'mixed') && (
        <Field label="אחוז מהתוצאה (%) *">
          <input type="number" step="0.5" value={form.feePercent} onChange={set('feePercent')} className="input-dark" dir="ltr" />
        </Field>
      )}
      <Field label="תנאי תשלום" span={2} hint="פריסה, מקדמות, אבני דרך">
        <textarea rows={2} value={form.paymentTerms} onChange={set('paymentTerms')} className="input-dark resize-none" />
      </Field>
      <Field label="תנאים נוספים" span={2}>
        <textarea rows={2} value={form.extraTerms} onChange={set('extraTerms')} className="input-dark resize-none" />
      </Field>
      <Field label="כתובת המשרד"><input type="text" value={form.officeAddress} onChange={set('officeAddress')} className="input-dark" /></Field>
      <Field label="טלפון המשרד"><input type="tel" value={form.officePhone} onChange={set('officePhone')} className="input-dark" dir="ltr" /></Field>
    </GeneratorForm>
  )
}

/* ===== 5. מחולל חוות דעת ראשונית ===== */

function AiPanel({ profile, endpoint, blurb, button, onApply, warn, factsText, setFactsText, factsLabel, clarify }) {
  const [files, setFiles] = useState([])
  const [selected, setSelected] = useState([])
  const [running, setRunning] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [asking, setAsking] = useState(false)
  const fileInputRef = useRef(null)

  const loadFiles = useCallback(() => {
    fetch(`/api/files?caseId=${profile.case_id}`)
      .then(r => r.json())
      .then(d => setFiles(d.files || []))
      .catch(() => {})
  }, [profile.case_id])

  useEffect(() => { loadFiles() }, [loadFiles])

  const analyzable = files.filter(f =>
    (f.mime_type || '').startsWith('image/') || f.mime_type === 'application/pdf'
  )

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const handleUpload = async (e) => {
    const list = Array.from(e.target.files || [])
    if (!list.length) return
    setError(''); setNote(''); setUploading(true)
    const newIds = []
    try {
      for (const file of list) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('caseId', profile.case_id)
        fd.append('uploadedBy', 'admin')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'העלאת הקובץ נכשלה')
        if (data.id != null) newIds.push(data.id)
      }
      loadFiles()
      // סימון אוטומטי של הקבצים שהועלו כעת לניתוח
      setSelected(s => [...new Set([...s, ...newIds])])
      setNote(`${list.length === 1 ? 'הקובץ הועלה' : `${list.length} קבצים הועלו`} וסומנו לניתוח.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const askQuestions = async () => {
    setError(''); setNote(''); setAsking(true)
    try {
      const res = await fetch(`/api/admin/litigation/${profile.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'questions', fileIds: selected, factsText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה בהפקת שאלות')
      const qs = data.questions || []
      setQuestions(qs)
      setAnswers({})
      setNote(qs.length
        ? 'המחולל העלה שאלות הבהרה — ענה על הרלוונטיות (אפשר לדלג על חלקן) ואז נסח את הטיוטה.'
        : 'אין שאלות הבהרה נוספות — ניתן לנסח את הטיוטה.')
    } catch (err) {
      setError(err.message)
    } finally {
      setAsking(false)
    }
  }

  const run = async () => {
    setError(''); setNote(''); setRunning(true)
    try {
      const answered = questions
        .map(q => ({ question: q.question, answer: (answers[q.id] || '').trim() }))
        .filter(a => a.answer)
      const res = await fetch(`/api/admin/litigation/${profile.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds: selected, factsText, answers: answered }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה בניתוח')
      onApply(data.analysis)
      const skipped = data.skippedFiles?.length
        ? ` (קבצים שלא נותחו: ${data.skippedFiles.join(', ')})` : ''
      const used = answered.length ? ` שולבו ${answered.length} הבהרות.` : ''
      setNote(`הופק ומולא בטופס — עבור עליו, ערוך ואשר לפני יצירת המסמך.${used}${skipped}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="border border-gold-500/30 bg-gold-500/5 rounded-xl p-4 mb-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">✨</span>
        <div className="text-white font-bold text-sm">ניתוח AI אוטומטי</div>
      </div>
      <p className="text-gray-400 text-xs mb-3">{blurb}</p>
      {warn && <p className="text-red-300/80 text-xs mb-3">{warn}</p>}

      {typeof factsText === 'string' && setFactsText && (
        <div className="mb-3">
          <div className="text-gray-500 text-xs mb-1.5">{factsLabel || 'תיאור העובדות/המקרה של הלקוח:'}</div>
          <textarea
            rows={5} value={factsText} onChange={e => setFactsText(e.target.value)}
            className="input-dark resize-y text-sm"
            placeholder="תאר/י את המקרה, השתלשלות האירועים, מה קרה בין הצדדים, סכומים, מועדים..."
          />
        </div>
      )}

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-gray-500 text-xs">מסמכים/תמונות מהתיק לניתוח (אופציונלי):</div>
          <div>
            <input
              ref={fileInputRef} type="file" multiple
              accept="image/*,application/pdf"
              onChange={handleUpload} className="hidden"
            />
            <button
              type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="text-xs px-2.5 py-1 rounded-lg border border-gold-500/40 text-gold-300 hover:bg-gold-500/10 disabled:opacity-60"
            >
              {uploading ? 'מעלה...' : '＋ העלה קבצים מהלקוח'}
            </button>
          </div>
        </div>
        {analyzable.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {analyzable.map(f => (
              <label
                key={f.id}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                  selected.includes(f.id)
                    ? 'border-gold-500/50 bg-gold-500/10 text-gold-300'
                    : 'border-[#1e1e1e] text-gray-400 hover:border-[#333]'
                }`}
              >
                <input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggle(f.id)} className="accent-yellow-500" />
                {(f.mime_type || '').startsWith('image/') ? '🖼️' : '📄'} {f.original_name}
              </label>
            ))}
          </div>
        ) : (
          <div className="text-gray-600 text-xs">אין עדיין קבצים לניתוח — ניתן להעלות תכתובות/תמונות/מסמכים מהלקוח.</div>
        )}
      </div>

      {clarify && questions.length > 0 && (
        <div className="mb-3 border border-gold-500/20 rounded-lg p-3 bg-black/20">
          <div className="text-gold-300 font-bold text-xs mb-2">שאלות הבהרה מהמחולל — ענה כדי לחדד את הטיעון (לא חובה על כולן):</div>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q.id || i}>
                <div className="text-gray-200 text-xs font-medium">{i + 1}. {q.question}</div>
                {q.why && <div className="text-gray-500 text-[11px] mb-1">מדוע חשוב: {q.why}</div>}
                <textarea
                  rows={2}
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                  className="input-dark resize-y text-sm"
                  placeholder="תשובתך (אפשר להשאיר ריק ולדלג)..."
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <Notice kind="error">{error}</Notice>}
      {note && <Notice kind="success">{note}</Notice>}

      <div className="flex flex-wrap gap-2">
        {clarify && (
          <button
            type="button" onClick={askQuestions} disabled={asking || running}
            className="text-sm px-4 py-2 rounded-lg border border-gold-500/40 text-gold-300 hover:bg-gold-500/10 disabled:opacity-60"
          >
            {asking ? 'מכין שאלות...' : (questions.length ? '↻ רענן שאלות הבהרה' : '❓ קבל שאלות הבהרה')}
          </button>
        )}
        <button type="button" onClick={run} disabled={running || asking} className="btn-gold text-sm disabled:opacity-60">
          {running ? 'מנסח... (עשוי לקחת עד דקה)' : button}
        </button>
      </div>
    </div>
  )
}

export function OpinionForm({ profile }) {
  const facts = profile.facts ? JSON.parse(profile.facts) : {}
  const [sourceIds, setSourceIds] = useState([])
  const [factsText, setFactsText] = useState(facts.chronology || '')
  const [form, set, setForm] = useForm({
    background: facts.chronology || '', legalQuestions: '', strengths: '', weaknesses: '',
    analysis: '', strategy: '', prospects: 'medium', prospectsReasoning: '', recommendations: '',
  })

  const applyAnalysis = (a) => {
    setForm(f => ({
      ...f,
      background: a.background || f.background,
      legalQuestions: a.legalQuestions || f.legalQuestions,
      strengths: a.strengths || f.strengths,
      weaknesses: a.weaknesses || f.weaknesses,
      analysis: [a.analysis, a.documentObservations ? `\n\nממצאים מהמסמכים/התמונות:\n${a.documentObservations}` : '']
        .filter(Boolean).join(''),
      strategy: a.strategy || f.strategy,
      prospects: a.prospects || f.prospects,
      prospectsReasoning: a.prospectsReasoning || f.prospectsReasoning,
      recommendations: a.recommendations || f.recommendations,
    }))
    if (a.background) setFactsText(a.background)
    if (Array.isArray(a.citedSourceIds) && a.citedSourceIds.length) {
      setSourceIds(a.citedSourceIds)
    }
  }

  return (
    <GeneratorForm
      profile={profile} docType="opinion" title="מחולל חוות דעת ראשונית"
      description="הערכת סיכויי ההליך על יסוד העובדות והדין — נשענת על לפחות 3 מקורות משפטיים"
      buildData={() => form}
      sourceIds={sourceIds} setSourceIds={setSourceIds}
      headerExtra={
        <AiPanel
          profile={profile} endpoint="opinion-ai" onApply={applyAnalysis}
          factsText={factsText} setFactsText={setFactsText}
          factsLabel="תיאור העובדות/המקרה של הלקוח (יישמר בתיק וישמש בסיס לניתוח):"
          button="✨ נתח אוטומטית ומלא את הטופס"
          blurb="הזן/י את תיאור המקרה של הלקוח והעלה/י תכתובות, תמונות ומסמכים. המערכת תפיק תיאור עובדתי של שני הצדדים, תעריך סיכויים, תגבש אסטרטגיה ראשונית, תנתח חוזקות וחולשות ותבצע ניתוח משפטי מפורט על יסוד מקורות משפטיים אמיתיים — ותמלא את הטופס. הכל ניתן לעריכה לאחר מכן."
        />
      }
      valid={() => {
        if (!form.background.trim()) return 'יש למלא רקע עובדתי'
        if (!form.legalQuestions.trim()) return 'יש למלא את השאלות המשפטיות'
        if (!form.recommendations.trim()) return 'יש למלא המלצות'
        return true
      }}
    >
      <Field label="רקע עובדתי — גרסאות הצדדים *" span={2} hint="תיאור עובדתי של שני הצדדים — נטען מהניתוח / מטופס תיאור המקרה, ניתן לערוך">
        <textarea required rows={5} value={form.background} onChange={set('background')} className="input-dark resize-none" />
      </Field>
      <Field label="השאלות המשפטיות הטעונות הכרעה *" span={2}>
        <textarea required rows={3} value={form.legalQuestions} onChange={set('legalQuestions')} className="input-dark resize-none" />
      </Field>
      <Field label="נקודות חוזק"><textarea rows={3} value={form.strengths} onChange={set('strengths')} className="input-dark resize-none" /></Field>
      <Field label="נקודות חולשה וסיכונים"><textarea rows={3} value={form.weaknesses} onChange={set('weaknesses')} className="input-dark resize-none" /></Field>
      <Field label="ניתוח משפטי מפורט" span={2}>
        <textarea rows={4} value={form.analysis} onChange={set('analysis')} className="input-dark resize-none" />
      </Field>
      <Field label="אסטרטגיה ראשונית" span={2} hint="דרך ניהול התיק המומלצת על יסוד הניתוח">
        <textarea rows={3} value={form.strategy} onChange={set('strategy')} className="input-dark resize-none" />
      </Field>
      <Field label="הערכת סיכויים *">
        <select value={form.prospects} onChange={set('prospects')} className="input-dark">
          <option value="high">גבוהים (מעל 70%)</option>
          <option value="medium_high">בינוניים-גבוהים (70%-50%)</option>
          <option value="medium">בינוניים (60%-40%)</option>
          <option value="medium_low">בינוניים-נמוכים (50%-30%)</option>
          <option value="low">נמוכים (מתחת ל-30%)</option>
        </select>
      </Field>
      <Field label="נימוק ההערכה">
        <textarea rows={2} value={form.prospectsReasoning} onChange={set('prospectsReasoning')} className="input-dark resize-none" />
      </Field>
      <Field label="המלצות לדרך פעולה *" span={2}>
        <textarea required rows={3} value={form.recommendations} onChange={set('recommendations')} className="input-dark resize-none" />
      </Field>
    </GeneratorForm>
  )
}

/* ===== 6. מחולל מכתב התרעה ===== */

export function WarningLetterForm({ profile }) {
  const intake = profile.intake ? JSON.parse(profile.intake) : {}
  const facts = profile.facts ? JSON.parse(profile.facts) : {}
  const [form, set] = useForm({
    recipientName: intake.opposingName || '', recipientId: intake.opposingId || '',
    recipientAddress: intake.opposingAddress || '',
    subject: '', facts: facts.chronology || '', demands: '',
    demandAmount: facts.damageAmount || '', deadlineDays: '14', alsoEmail: false,
  })
  return (
    <GeneratorForm
      profile={profile} docType="warning_letter" title="מחולל מכתב התרעה"
      description="מכתב התרעה בטרם נקיטת הליכים משפטיים — פרטי הנמען נטענים מטופס הכר את הלקוח"
      buildData={() => form}
      valid={() => {
        if (!form.recipientName.trim()) return 'יש למלא שם נמען'
        if (!form.facts.trim()) return 'יש למלא את תיאור העובדות'
        if (!form.demands.trim()) return 'יש למלא את הדרישות'
        return true
      }}
    >
      <Field label="שם הנמען *"><input required type="text" value={form.recipientName} onChange={set('recipientName')} className="input-dark" /></Field>
      <Field label="ת&quot;ז / ח&quot;פ הנמען"><input type="text" value={form.recipientId} onChange={set('recipientId')} className="input-dark" dir="ltr" /></Field>
      <Field label="כתובת הנמען" span={2}><input type="text" value={form.recipientAddress} onChange={set('recipientAddress')} className="input-dark" /></Field>
      <Field label="הנדון" span={2} hint="ברירת מחדל: התראה בטרם נקיטת הליכים משפטיים">
        <input type="text" value={form.subject} onChange={set('subject')} className="input-dark" />
      </Field>
      <Field label="תיאור העובדות וההפרות *" span={2}>
        <textarea required rows={5} value={form.facts} onChange={set('facts')} className="input-dark resize-none" />
      </Field>
      <Field label="הדרישות מהנמען *" span={2}>
        <textarea required rows={3} value={form.demands} onChange={set('demands')} className="input-dark resize-none" />
      </Field>
      <Field label="סכום נדרש (₪)"><input type="number" value={form.demandAmount} onChange={set('demandAmount')} className="input-dark" dir="ltr" /></Field>
      <Field label="מועד לציות (ימים)"><input type="number" value={form.deadlineDays} onChange={set('deadlineDays')} className="input-dark" dir="ltr" /></Field>
      <Field label="" span={2}>
        <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
          <input type="checkbox" checked={form.alsoEmail} onChange={set('alsoEmail')} className="accent-yellow-500" />
          המכתב יישלח גם בדוא"ל
        </label>
      </Field>
    </GeneratorForm>
  )
}

/* ===== 7. מחולל כתב תביעה ===== */

const COURTS = ['משפט השלום', 'המשפט המחוזי', 'הדין האזורי לעבודה', 'המשפט לענייני משפחה', 'המשפט לעניינים מינהליים']

export function ClaimForm({ profile }) {
  const intake = profile.intake ? JSON.parse(profile.intake) : {}
  const facts = profile.facts ? JSON.parse(profile.facts) : {}
  const [sourceIds, setSourceIds] = useState([])
  const [factsText, setFactsText] = useState(facts.chronology || '')
  const [form, set, setForm] = useForm({
    court: 'משפט השלום', courtCity: '', officeAddress: '',
    defendantName: intake.opposingName || '', defendantId: intake.opposingId || '',
    defendantAddress: intake.opposingAddress || '',
    claimNature: '', claimAmount: facts.damageAmount || '',
    jurisdiction: '', priorProceedings: intake.previousProceedings || '',
    summary: '', facts: facts.chronology || '', legalArguments: '', remedies: '',
  })

  const applyClaim = (a) => {
    setForm(f => ({
      ...f,
      claimNature: a.claimNature || f.claimNature,
      jurisdiction: a.jurisdiction || f.jurisdiction,
      summary: a.summary || f.summary,
      facts: a.facts || f.facts,
      legalArguments: a.legalArguments || f.legalArguments,
      remedies: a.remedies || f.remedies,
    }))
    if (Array.isArray(a.citedSourceIds) && a.citedSourceIds.length) setSourceIds(a.citedSourceIds)
  }

  return (
    <GeneratorForm
      profile={profile} docType="statement_of_claim" title="מחולל כתב תביעה"
      description='מבנה לפי תקנות 9–10 לתקנות סדר הדין האזרחי, תשע"ט-2018: כותרת, פרטי תביעה, תמצית טענות ופירוט עובדות'
      buildData={() => form}
      sourceIds={sourceIds} setSourceIds={setSourceIds}
      headerExtra={
        <AiPanel
          profile={profile} endpoint="claim-ai" onApply={applyClaim} clarify
          factsText={factsText} setFactsText={setFactsText}
          factsLabel="תיאור המקרה / טענות התובע (יישמר בתיק וישמש בסיס לניסוח):"
          button="✨ נסח טיוטת כתב תביעה"
          blurb="הזן/י את תיאור המקרה והעלה/י מסמכים. מומלץ ללחוץ תחילה על ‘קבל שאלות הבהרה’ — המחולל יעלה שאלות ממוקדות, ולאחר שתענה עליהן ינסח תמצית טענות, פירוט עובדות ממוספר, טיעון משפטי וסעדים — על יסוד המקורות המשפטיים. פרטי הצדדים והסכומים נשארים לעריכתך."
        />
      }
      valid={() => {
        if (!form.defendantName.trim()) return 'יש למלא את פרטי הנתבע'
        if (!form.summary.trim()) return 'יש למלא תמצית טענות'
        if (!form.facts.trim()) return 'יש למלא את פירוט העובדות'
        if (!form.remedies.trim()) return 'יש למלא את הסעדים המבוקשים'
        return true
      }}
    >
      <Field label="ערכאה *">
        <select value={form.court} onChange={set('court')} className="input-dark">
          {COURTS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="עיר"><input type="text" value={form.courtCity} onChange={set('courtCity')} className="input-dark" /></Field>
      <Field label="שם הנתבע/ת *"><input required type="text" value={form.defendantName} onChange={set('defendantName')} className="input-dark" /></Field>
      <Field label="ת&quot;ז / ח&quot;פ הנתבע/ת"><input type="text" value={form.defendantId} onChange={set('defendantId')} className="input-dark" dir="ltr" /></Field>
      <Field label="כתובת הנתבע/ת" span={2}><input type="text" value={form.defendantAddress} onChange={set('defendantAddress')} className="input-dark" /></Field>
      <Field label="מהות התביעה" hint='לדוגמה: "תביעה כספית, חוזית"'>
        <input type="text" value={form.claimNature} onChange={set('claimNature')} className="input-dark" />
      </Field>
      <Field label="סכום התביעה (₪)"><input type="number" value={form.claimAmount} onChange={set('claimAmount')} className="input-dark" dir="ltr" /></Field>
      <Field label="נימוקי סמכות עניינית ומקומית" span={2}>
        <textarea rows={2} value={form.jurisdiction} onChange={set('jurisdiction')} className="input-dark resize-none" />
      </Field>
      <Field label="הליכים קודמים בין הצדדים" span={2}>
        <textarea rows={2} value={form.priorProceedings} onChange={set('priorProceedings')} className="input-dark resize-none" />
      </Field>
      <Field label="תמצית הטענות *" span={2} hint="לפי תקנה 10(2) — תמצית קצרה של העובדות והעילות">
        <textarea required rows={3} value={form.summary} onChange={set('summary')} className="input-dark resize-none" />
      </Field>
      <Field label="פירוט העובדות *" span={2} hint="כל שורה תהפוך לסעיף ממוספר בכתב התביעה — נטען מטופס תיאור המקרה">
        <textarea required rows={7} value={form.facts} onChange={set('facts')} className="input-dark resize-none" />
      </Field>
      <Field label="הטיעון המשפטי" span={2} hint="כל שורה תהפוך לסעיף — העילות והוראות הדין עליהן נסמכת התביעה">
        <textarea rows={4} value={form.legalArguments} onChange={set('legalArguments')} className="input-dark resize-none" />
      </Field>
      <Field label="הסעדים המבוקשים *" span={2} hint="סעד אחד בכל שורה">
        <textarea required rows={3} value={form.remedies} onChange={set('remedies')} className="input-dark resize-none" placeholder={'לחייב את הנתבע לשלם לתובע סך של...\nצו עשה המורה לנתבע...'} />
      </Field>
      <Field label="כתובת המשרד להמצאת כתבי בי-דין" span={2}>
        <input type="text" value={form.officeAddress} onChange={set('officeAddress')} className="input-dark" />
      </Field>
    </GeneratorForm>
  )
}

/* ===== 8. מחולל כתב הגנה ===== */

const PRELIM_OPTIONS = [
  { value: 'limitation', label: 'התיישנות' },
  { value: 'laches', label: 'שיהוי' },
  { value: 'no_cause', label: 'העדר עילה' },
  { value: 'no_jurisdiction', label: 'העדר סמכות' },
  { value: 'no_privity', label: 'העדר יריבות' },
  { value: 'abuse', label: 'שימוש לרעה בהליכי משפט' },
]

export function DefenseForm({ profile }) {
  const facts = profile.facts ? JSON.parse(profile.facts) : {}
  const [sourceIds, setSourceIds] = useState([])
  const [factsText, setFactsText] = useState(facts.chronology || '')
  const [form, set, setForm] = useForm({
    court: 'משפט השלום', courtCity: '', caseNumber: profile.case_number || '',
    plaintiffName: '', plaintiffCounsel: '',
    preliminaryDefenses: [], responses: '', defendantVersion: '', counterArguments: '',
  })
  const togglePrelim = (v) => {
    setForm(f => ({
      ...f,
      preliminaryDefenses: f.preliminaryDefenses.includes(v)
        ? f.preliminaryDefenses.filter(x => x !== v)
        : [...f.preliminaryDefenses, v],
    }))
  }

  const applyDefense = (a) => {
    setForm(f => ({
      ...f,
      preliminaryDefenses: Array.isArray(a.preliminaryDefenses) ? a.preliminaryDefenses : f.preliminaryDefenses,
      responses: a.responses || f.responses,
      defendantVersion: a.defendantVersion || f.defendantVersion,
      counterArguments: a.counterArguments || f.counterArguments,
    }))
    if (Array.isArray(a.citedSourceIds) && a.citedSourceIds.length) setSourceIds(a.citedSourceIds)
  }
  return (
    <div className="space-y-6">
      {profile.opposing_claim && (
        <div className="bg-[#0d0d0d] border border-[#252525] rounded-xl p-4">
          <div className="text-white font-bold text-sm mb-2">כתב התביעה שהתקבל (לעיון)</div>
          <div className="text-gray-400 text-xs whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">{profile.opposing_claim}</div>
        </div>
      )}
      <GeneratorForm
        profile={profile} docType="statement_of_defense" title="מחולל כתב הגנה"
        description="טענות מקדמיות, מענה סעיף-סעיף וגרסת הנתבע — בהתאם לתקנות סדר הדין האזרחי"
        buildData={() => form}
        sourceIds={sourceIds} setSourceIds={setSourceIds}
        headerExtra={
          <AiPanel
            profile={profile} endpoint="defense-ai" onApply={applyDefense} clarify
            factsText={factsText} setFactsText={setFactsText}
            factsLabel="גרסת/טענות הלקוח (יישמר בתיק וישמש בסיס לניסוח):"
            button="✨ נסח טיוטת כתב הגנה"
            blurb="הזן/י את גרסת הלקוח וטענותיו והעלה/י מסמכים. מומלץ ללחוץ תחילה על ‘קבל שאלות הבהרה’ — המחולל ינתח את כתב התביעה שהתקבל ויעלה שאלות ממוקדות; לאחר שתענה עליהן יזהה טענות מקדמיות רלוונטיות, ינסח מענה סעיף-סעיף, גרסת נתבע וטיעון משפטי — מבוסס על המקורות המשפטיים."
            warn={!profile.opposing_claim ? 'לא הוזן כתב תביעה שהתקבל — הניתוח יהיה כללי. מומלץ להזין אותו תחילה בלשונית "כתב התביעה שהתקבל".' : undefined}
          />
        }
        valid={() => {
          if (!form.plaintiffName.trim()) return 'יש למלא את שם התובע'
          if (!form.responses.trim()) return 'יש למלא מענה לטענות כתב התביעה'
          if (!form.defendantVersion.trim()) return 'יש למלא את גרסת הנתבע'
          return true
        }}
      >
        <Field label="ערכאה *">
          <select value={form.court} onChange={set('court')} className="input-dark">
            {COURTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="עיר"><input type="text" value={form.courtCity} onChange={set('courtCity')} className="input-dark" /></Field>
        <Field label="מספר התיק"><input type="text" value={form.caseNumber} onChange={set('caseNumber')} className="input-dark" dir="ltr" /></Field>
        <Field label="שם התובע/ת *"><input required type="text" value={form.plaintiffName} onChange={set('plaintiffName')} className="input-dark" /></Field>
        <Field label="ב&quot;כ התובע/ת" span={2}><input type="text" value={form.plaintiffCounsel} onChange={set('plaintiffCounsel')} className="input-dark" /></Field>
        <Field label="טענות מקדמיות" span={2}>
          <div className="flex flex-wrap gap-2 mt-1">
            {PRELIM_OPTIONS.map(o => (
              <button
                key={o.value} type="button" onClick={() => togglePrelim(o.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  form.preliminaryDefenses.includes(o.value)
                    ? 'bg-gold-500 text-black'
                    : 'bg-[#0d0d0d] border border-[#1e1e1e] text-gray-400 hover:border-gold-500/30'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="מענה לטענות כתב התביעה *" span={2} hint='כל שורה תהפוך לסעיף — לדוגמה: "האמור בסעיף 5 לכתב התביעה מוכחש מכל וכל"'>
          <textarea required rows={6} value={form.responses} onChange={set('responses')} className="input-dark resize-none" />
        </Field>
        <Field label="גרסת הנתבע — העובדות לאשורן *" span={2} hint="כל שורה תהפוך לסעיף ממוספר">
          <textarea required rows={6} value={form.defendantVersion} onChange={set('defendantVersion')} className="input-dark resize-none" />
        </Field>
        <Field label="הטיעון המשפטי" span={2}>
          <textarea rows={4} value={form.counterArguments} onChange={set('counterArguments')} className="input-dark resize-none" />
        </Field>
      </GeneratorForm>
    </div>
  )
}

/* ===== 9. מחולל בקשות וסעדים ===== */

export function MotionForm({ profile }) {
  const intake = profile.intake ? JSON.parse(profile.intake) : {}
  const [form, set] = useForm({
    motionType: 'temp_attachment', court: 'משפט השלום', courtCity: '',
    caseNumber: profile.case_number || '', respondentName: intake.opposingName || '',
    requestedRelief: '', background: '', legalGrounds: '', urgency: '',
  })
  const needsAffidavit = MOTION_TYPES[form.motionType]?.affidavit
  return (
    <GeneratorForm
      profile={profile} docType="motion" title="מחולל בקשות וסעדים"
      description="בקשות ביניים וסעדים זמניים לפי פרק ט״ו לתקנות סדר הדין האזרחי, תשע״ט-2018"
      buildData={() => form}
      valid={() => {
        if (!form.respondentName.trim()) return 'יש למלא את שם המשיב'
        if (!form.requestedRelief.trim()) return 'יש למלא את הסעד המבוקש'
        if (!form.background.trim()) return 'יש למלא רקע עובדתי'
        if (!form.legalGrounds.trim()) return 'יש למלא נימוקים משפטיים'
        return true
      }}
    >
      <Field label="סוג הבקשה *" span={2}>
        <select value={form.motionType} onChange={set('motionType')} className="input-dark">
          {Object.entries(MOTION_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {needsAffidavit && (
          <p className="text-gold-500/70 text-xs mt-1">⚠️ בקשה זו מחייבת צירוף תצהיר תומך — יצוין אוטומטית במסמך</p>
        )}
      </Field>
      <Field label="ערכאה *">
        <select value={form.court} onChange={set('court')} className="input-dark">
          {COURTS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="עיר"><input type="text" value={form.courtCity} onChange={set('courtCity')} className="input-dark" /></Field>
      <Field label="מספר התיק"><input type="text" value={form.caseNumber} onChange={set('caseNumber')} className="input-dark" dir="ltr" /></Field>
      <Field label="שם המשיב/ה *"><input required type="text" value={form.respondentName} onChange={set('respondentName')} className="input-dark" /></Field>
      <Field label="הסעד המבוקש *" span={2}>
        <textarea required rows={3} value={form.requestedRelief} onChange={set('requestedRelief')} className="input-dark resize-none" />
      </Field>
      <Field label="הרקע העובדתי *" span={2} hint="כל שורה תהפוך לסעיף ממוספר">
        <textarea required rows={4} value={form.background} onChange={set('background')} className="input-dark resize-none" />
      </Field>
      <Field label="הנימוקים המשפטיים *" span={2} hint="כל שורה תהפוך לסעיף">
        <textarea required rows={4} value={form.legalGrounds} onChange={set('legalGrounds')} className="input-dark resize-none" />
      </Field>
      <Field label="דחיפות ומאזן הנוחות" span={2} hint="נדרש בעיקר בבקשות לסעדים זמניים">
        <textarea rows={3} value={form.urgency} onChange={set('urgency')} className="input-dark resize-none" />
      </Field>
    </GeneratorForm>
  )
}

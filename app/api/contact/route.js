import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { TERMS_VERSION } from '@/lib/terms'

function clientIp(request) {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { name, phone, email, message, termsToken } = body

  if (!name || !phone || !message) {
    return NextResponse.json({ error: 'חסרים שדות חובה' }, { status: 400 })
  }

  // אכיפת הדרישה החוקית: לא ניתן לסיים שליחת טופס ללא פתיחה יזומה
  // ואישור מתועדים של התקנון.
  if (!termsToken) {
    return NextResponse.json(
      { error: 'יש לפתוח ולאשר את התקנון לפני שליחת הטופס' },
      { status: 403 }
    )
  }

  const db = getDb()
  const view = db
    .prepare('SELECT * FROM terms_views WHERE token = ?')
    .get(termsToken)

  if (!view) {
    return NextResponse.json(
      { error: 'לא נמצא תיעוד צפייה בתקנון. יש לפתוח את התקנון מחדש.' },
      { status: 403 }
    )
  }
  if (!view.acknowledged_at) {
    return NextResponse.json(
      { error: 'התקנון נפתח אך לא אושר. יש לאשר את קריאת התקנון.' },
      { status: 403 }
    )
  }
  if (view.used_at) {
    return NextResponse.json(
      { error: 'אישור התקנון כבר שימש לשליחה קודמת. יש לפתוח את התקנון מחדש.' },
      { status: 409 }
    )
  }
  if (view.terms_version !== TERMS_VERSION) {
    return NextResponse.json(
      { error: 'התקנון התעדכן. יש לפתוח ולאשר את הגרסה העדכנית.' },
      { status: 409 }
    )
  }

  const ip = clientIp(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // רישום מתועד של השליחה יחד עם נתוני ההסכמה לתקנון, וסימון האסימון כמנוצל.
  const insert = db.prepare(
    `INSERT INTO contact_submissions
       (name, phone, email, message, terms_token, terms_version,
        terms_opened_at, terms_acknowledged_at, ip, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
  insert.run(
    name,
    phone,
    email || null,
    message,
    termsToken,
    view.terms_version,
    view.opened_at,
    view.acknowledged_at,
    ip,
    userAgent
  )
  db.prepare('UPDATE terms_views SET used_at = CURRENT_TIMESTAMP WHERE token = ?').run(
    termsToken
  )

  return NextResponse.json({ success: true })
}

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// נקרא לאחר שהגולש עיין בתקנון (גלילה עד סופו) ולחץ על אישור.
// מסמן את רשומת התיעוד כמאושרת, עם חותמת זמן.
export async function POST(request) {
  const { token } = await request.json().catch(() => ({}))
  if (!token) {
    return NextResponse.json({ error: 'חסר אסימון תקנון' }, { status: 400 })
  }

  const db = getDb()
  const row = db.prepare('SELECT token, used_at FROM terms_views WHERE token = ?').get(token)
  if (!row) {
    return NextResponse.json({ error: 'אסימון תקנון לא תקין' }, { status: 400 })
  }
  if (row.used_at) {
    return NextResponse.json({ error: 'אסימון התקנון כבר נוצל' }, { status: 409 })
  }

  db.prepare(
    `UPDATE terms_views SET acknowledged_at = CURRENT_TIMESTAMP WHERE token = ?`
  ).run(token)

  return NextResponse.json({ success: true })
}

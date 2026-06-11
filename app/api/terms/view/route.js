import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getDb } from '@/lib/db'
import { TERMS_VERSION } from '@/lib/terms'

function clientIp(request) {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

// נקרא ברגע שהגולש פותח באופן יזום את התקנון מתוך הטופס.
// יוצר רשומת תיעוד עם token חד-פעמי, ומחזיר אותו לדפדפן.
export async function POST(request) {
  const db = getDb()
  const token = crypto.randomUUID()
  const ip = clientIp(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'

  db.prepare(
    `INSERT INTO terms_views (token, terms_version, ip, user_agent)
     VALUES (?, ?, ?, ?)`
  ).run(token, TERMS_VERSION, ip, userAgent)

  return NextResponse.json({ token, version: TERMS_VERSION })
}

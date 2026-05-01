import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()
  const clients = db.prepare(`
    SELECT u.*, COUNT(c.id) as case_count
    FROM users u
    LEFT JOIN cases c ON c.user_id = u.id
    WHERE u.role = 'client'
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `).all()

  return NextResponse.json({ clients })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { username, password, name, email, phone } = await request.json()

  if (!username || !password || !name) {
    return NextResponse.json({ error: 'שם, שם משתמש וסיסמה הם שדות חובה' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'הסיסמה חייבת להכיל לפחות 6 תווים' }, { status: 400 })
  }

  const db = getDb()
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) {
    return NextResponse.json({ error: 'שם המשתמש כבר קיים במערכת' }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 12)
  const result = db.prepare(
    "INSERT INTO users (username, password, name, email, phone, role) VALUES (?, ?, ?, ?, ?, 'client')"
  ).run(username, hash, name, email || null, phone || null)

  return NextResponse.json({ id: result.lastInsertRowid })
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function PUT(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentPassword, newPassword } = await request.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'Password too short' }, { status: 400 })
  }

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) return NextResponse.json({ error: 'סיסמה נוכחית שגויה' }, { status: 400 })

  const newHash = await bcrypt.hash(newPassword, 12)
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newHash, session.user.id)

  return NextResponse.json({ success: true })
}

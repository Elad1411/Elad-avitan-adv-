import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()
  const client = db.prepare(
    "SELECT id, name, username, email, phone, created_at FROM users WHERE id = ? AND role = 'client'"
  ).get(params.id)
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const cases = db.prepare(`
    SELECT c.*,
           (SELECT COUNT(*) FROM files f WHERE f.case_id = c.id) as file_count,
           (SELECT lp.id FROM litigation_profiles lp WHERE lp.case_id = c.id) as litigation_id
    FROM cases c
    WHERE c.user_id = ?
    ORDER BY c.updated_at DESC, c.created_at DESC
  `).all(params.id)

  return NextResponse.json({ client, cases })
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()
  const user = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'client'").get(params.id)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // ניקוי מסמכי ליטיגציה ופרופילים המקושרים לתיקי הלקוח, כדי לא להשאיר רשומות יתומות
  db.prepare(`
    DELETE FROM litigation_documents WHERE profile_id IN (
      SELECT lp.id FROM litigation_profiles lp
      JOIN cases c ON lp.case_id = c.id WHERE c.user_id = ?
    )
  `).run(params.id)
  db.prepare('DELETE FROM litigation_profiles WHERE case_id IN (SELECT id FROM cases WHERE user_id = ?)').run(params.id)
  db.prepare('DELETE FROM case_updates WHERE case_id IN (SELECT id FROM cases WHERE user_id = ?)').run(params.id)
  db.prepare('DELETE FROM files WHERE user_id = ?').run(params.id)
  db.prepare('DELETE FROM cases WHERE user_id = ?').run(params.id)
  db.prepare('DELETE FROM users WHERE id = ?').run(params.id)

  return NextResponse.json({ success: true })
}

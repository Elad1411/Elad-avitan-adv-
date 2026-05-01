import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()
  const user = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'client'").get(params.id)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  db.prepare('DELETE FROM case_updates WHERE case_id IN (SELECT id FROM cases WHERE user_id = ?)').run(params.id)
  db.prepare('DELETE FROM files WHERE user_id = ?').run(params.id)
  db.prepare('DELETE FROM cases WHERE user_id = ?').run(params.id)
  db.prepare('DELETE FROM users WHERE id = ?').run(params.id)

  return NextResponse.json({ success: true })
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const updates = db.prepare(
    'SELECT * FROM case_updates WHERE case_id = ? ORDER BY created_at DESC'
  ).all(params.id)

  return NextResponse.json({ updates })
}

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, content } = await request.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const db = getDb()
  const result = db.prepare(
    'INSERT INTO case_updates (case_id, title, content) VALUES (?, ?, ?)'
  ).run(params.id, title || null, content.trim())

  db.prepare('UPDATE cases SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(params.id)

  return NextResponse.json({ id: result.lastInsertRowid })
}

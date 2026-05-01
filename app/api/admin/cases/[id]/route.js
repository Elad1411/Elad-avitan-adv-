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
  const c = db.prepare(`
    SELECT c.*, u.name as client_name
    FROM cases c LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(params.id)

  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ case: c })
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, status, area, court, judge, nextHearing, caseNumber, description } = await request.json()

  const db = getDb()
  db.prepare(`
    UPDATE cases SET
      title = ?, status = ?, area = ?, court = ?, judge = ?,
      next_hearing = ?, case_number = ?, description = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title, status, area, court || null, judge || null,
    nextHearing || null, caseNumber || null, description || null,
    params.id
  )

  return NextResponse.json({ success: true })
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()
  db.prepare('DELETE FROM case_updates WHERE case_id = ?').run(params.id)
  db.prepare('DELETE FROM files WHERE case_id = ?').run(params.id)
  db.prepare('DELETE FROM cases WHERE id = ?').run(params.id)

  return NextResponse.json({ success: true })
}

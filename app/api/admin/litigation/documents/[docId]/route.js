import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return null
  return session
}

export async function GET(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { docId } = await params
  const db = getDb()
  const doc = db.prepare(`
    SELECT ld.*, lp.role, lp.area, lp.case_id, c.title as case_title
    FROM litigation_documents ld
    JOIN litigation_profiles lp ON ld.profile_id = lp.id
    JOIN cases c ON lp.case_id = c.id
    WHERE ld.id = ?
  `).get(docId)
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ document: doc })
}

export async function DELETE(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { docId } = await params
  const db = getDb()
  const doc = db.prepare('SELECT id FROM litigation_documents WHERE id = ?').get(docId)
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  db.prepare('DELETE FROM litigation_documents WHERE id = ?').run(docId)
  return NextResponse.json({ ok: true })
}

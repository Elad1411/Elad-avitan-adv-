import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return null
  return session
}

function getProfile(db, id) {
  return db.prepare(`
    SELECT lp.*, c.title as case_title, c.case_number, c.status as case_status,
           c.court, c.judge, c.next_hearing, c.user_id,
           u.name as client_name, u.email as client_email, u.phone as client_phone
    FROM litigation_profiles lp
    JOIN cases c ON lp.case_id = c.id
    LEFT JOIN users u ON c.user_id = u.id
    WHERE lp.id = ?
  `).get(id)
}

export async function GET(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const db = getDb()
  const profile = getProfile(db, id)
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const documents = db.prepare(`
    SELECT id, doc_type, title, sources, created_at
    FROM litigation_documents WHERE profile_id = ? ORDER BY created_at DESC
  `).all(id)

  return NextResponse.json({ profile, documents })
}

export async function PUT(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const db = getDb()
  const profile = db.prepare('SELECT id FROM litigation_profiles WHERE id = ?').get(id)
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const fields = []
  const values = []

  if (body.role !== undefined) { fields.push('role = ?'); values.push(body.role) }
  if (body.area !== undefined) { fields.push('area = ?'); values.push(body.area) }
  if (body.intake !== undefined) { fields.push('intake = ?'); values.push(JSON.stringify(body.intake)) }
  if (body.facts !== undefined) { fields.push('facts = ?'); values.push(JSON.stringify(body.facts)) }
  if (body.opposingClaim !== undefined) { fields.push('opposing_claim = ?'); values.push(body.opposingClaim) }

  if (!fields.length) {
    return NextResponse.json({ error: 'לא נשלחו שדות לעדכון' }, { status: 400 })
  }
  fields.push("updated_at = CURRENT_TIMESTAMP")
  db.prepare(`UPDATE litigation_profiles SET ${fields.join(', ')} WHERE id = ?`).run(...values, id)

  return NextResponse.json({ ok: true })
}

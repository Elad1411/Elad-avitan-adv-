import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'
import { AREA_LABELS } from '@/lib/legal-sources'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return null
  return session
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const db = getDb()
  const profiles = db.prepare(`
    SELECT lp.*, c.title as case_title, c.case_number, c.status as case_status,
           u.name as client_name,
           (SELECT COUNT(*) FROM litigation_documents ld WHERE ld.profile_id = lp.id) as doc_count
    FROM litigation_profiles lp
    JOIN cases c ON lp.case_id = c.id
    LEFT JOIN users u ON c.user_id = u.id
    ORDER BY lp.updated_at DESC, lp.created_at DESC
  `).all()
  return NextResponse.json({ profiles })
}

export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { caseId, role, area } = await request.json()

  if (!caseId) {
    return NextResponse.json({ error: 'יש לבחור תיק' }, { status: 400 })
  }
  if (!['plaintiff', 'defendant'].includes(role)) {
    return NextResponse.json({ error: 'יש לבחור צד מיוצג (תובע/נתבע)' }, { status: 400 })
  }
  if (!AREA_LABELS[area]) {
    return NextResponse.json({ error: 'יש לבחור תחום משפטי' }, { status: 400 })
  }

  const db = getDb()
  const caseRow = db.prepare('SELECT id FROM cases WHERE id = ?').get(caseId)
  if (!caseRow) {
    return NextResponse.json({ error: 'התיק לא נמצא' }, { status: 404 })
  }
  const existing = db.prepare('SELECT id FROM litigation_profiles WHERE case_id = ?').get(caseId)
  if (existing) {
    return NextResponse.json({ error: 'כבר קיים תיק ליטיגציה עבור תיק זה', id: existing.id }, { status: 409 })
  }

  const result = db.prepare(`
    INSERT INTO litigation_profiles (case_id, role, area) VALUES (?, ?, ?)
  `).run(caseId, role, area)

  return NextResponse.json({ id: result.lastInsertRowid })
}

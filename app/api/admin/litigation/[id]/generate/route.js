import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'
import { getSourceById, AREA_LABELS } from '@/lib/legal-sources'
import { DOC_TYPES } from '@/lib/generators'

const MIN_SOURCES = 3

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const db = getDb()

  const profile = db.prepare(`
    SELECT lp.*, c.title as case_title, c.case_number, c.court, c.judge,
           u.name as client_name, u.email as client_email, u.phone as client_phone
    FROM litigation_profiles lp
    JOIN cases c ON lp.case_id = c.id
    LEFT JOIN users u ON c.user_id = u.id
    WHERE lp.id = ?
  `).get(id)
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { docType, data = {}, sourceIds = [] } = await request.json()

  const docDef = DOC_TYPES[docType]
  if (!docDef) {
    return NextResponse.json({ error: 'סוג מסמך לא מוכר' }, { status: 400 })
  }

  // אכיפת כלל המקורות: כל מסמך משפטי חייב להישען על לפחות 3 מקורות מהספרייה
  const uniqueIds = [...new Set(sourceIds)]
  const sources = uniqueIds.map(getSourceById).filter(Boolean)
  if (sources.length < MIN_SOURCES) {
    return NextResponse.json(
      { error: `יש לבחור לפחות ${MIN_SOURCES} מקורות משפטיים מהספרייה (נבחרו ${sources.length})` },
      { status: 400 }
    )
  }

  const intake = profile.intake ? JSON.parse(profile.intake) : {}
  const client = {
    name: intake.fullName || profile.client_name || '',
    idNumber: intake.idNumber || '',
    address: intake.address || '',
    phone: intake.phone || profile.client_phone || '',
    email: intake.email || profile.client_email || '',
  }

  const html = docDef.build({
    client,
    caseRow: { title: profile.case_title, case_number: profile.case_number, court: profile.court },
    data,
    sources,
    area: profile.area,
    areaLabel: AREA_LABELS[profile.area] || profile.area,
    role: profile.role,
  })

  const title = `${docDef.label} — ${profile.case_title}`
  const result = db.prepare(`
    INSERT INTO litigation_documents (profile_id, doc_type, title, params, html, sources)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, docType, title, JSON.stringify(data), html, JSON.stringify(sources))

  db.prepare('UPDATE litigation_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id)

  return NextResponse.json({ docId: result.lastInsertRowid })
}

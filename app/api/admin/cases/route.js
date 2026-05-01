import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : null

  const db = getDb()
  let query = `
    SELECT c.*, u.name as client_name
    FROM cases c
    LEFT JOIN users u ON c.user_id = u.id
    ORDER BY c.updated_at DESC, c.created_at DESC
  `
  if (limit) query += ` LIMIT ${limit}`

  const cases = db.prepare(query).all()
  return NextResponse.json({ cases })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId, title, description, area, status, caseNumber, court, judge, nextHearing } = await request.json()

  if (!userId || !title) {
    return NextResponse.json({ error: 'לקוח וכותרת הם שדות חובה' }, { status: 400 })
  }

  const db = getDb()
  const result = db.prepare(`
    INSERT INTO cases (user_id, title, description, area, status, case_number, court, judge, next_hearing)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId, title, description || null, area || 'criminal',
    status || 'פתוח', caseNumber || null, court || null, judge || null,
    nextHearing || null
  )

  return NextResponse.json({ id: result.lastInsertRowid })
}

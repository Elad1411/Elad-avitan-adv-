import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const caseId = searchParams.get('caseId')

  const db = getDb()
  let files

  if (session.user.role === 'admin') {
    if (caseId) {
      files = db.prepare(
        'SELECT f.*, u.name as uploader_name FROM files f LEFT JOIN users u ON f.user_id = u.id WHERE f.case_id = ? ORDER BY f.created_at DESC'
      ).all(caseId)
    } else {
      files = db.prepare(
        'SELECT f.*, u.name as uploader_name FROM files f LEFT JOIN users u ON f.user_id = u.id ORDER BY f.created_at DESC'
      ).all()
    }
  } else {
    if (caseId) {
      files = db.prepare(
        'SELECT f.* FROM files f JOIN cases c ON f.case_id = c.id WHERE f.case_id = ? AND c.user_id = ? ORDER BY f.created_at DESC'
      ).all(caseId, session.user.id)
    } else {
      files = db.prepare(
        'SELECT f.*, c.title as case_title FROM files f LEFT JOIN cases c ON f.case_id = c.id WHERE f.user_id = ? ORDER BY f.created_at DESC'
      ).all(session.user.id)
    }
  }

  return NextResponse.json({ files })
}

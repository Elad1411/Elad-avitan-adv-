import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'
import { readFile, unlink } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './data/uploads'

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(params.id)
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.user.role !== 'admin') {
    const hasAccess = db.prepare(
      'SELECT 1 FROM files f LEFT JOIN cases c ON f.case_id = c.id WHERE f.id = ? AND (f.user_id = ? OR c.user_id = ?)'
    ).get(params.id, session.user.id, session.user.id)
    if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const filePath = path.join(UPLOAD_DIR, file.stored_name)
    const buffer = await readFile(filePath)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.mime_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.original_name)}`,
        'Content-Length': String(buffer.length),
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()
  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(params.id)
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    await unlink(path.join(UPLOAD_DIR, file.stored_name))
  } catch { /* File may not exist on disk */ }

  db.prepare('DELETE FROM files WHERE id = ?').run(params.id)
  return NextResponse.json({ success: true })
}

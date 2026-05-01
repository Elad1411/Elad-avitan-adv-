import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './data/uploads'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await mkdir(UPLOAD_DIR, { recursive: true })

    const formData = await request.formData()
    const file = formData.get('file')
    const caseId = formData.get('caseId')
    const uploadedBy = formData.get('uploadedBy') || 'client'

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name) || ''
    const storedName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`
    const filePath = path.join(UPLOAD_DIR, storedName)

    await writeFile(filePath, buffer)

    const db = getDb()
    const result = db.prepare(`
      INSERT INTO files (case_id, user_id, original_name, stored_name, file_size, mime_type, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      caseId ? Number(caseId) : null,
      session.user.id,
      file.name,
      storedName,
      buffer.length,
      file.type || 'application/octet-stream',
      uploadedBy
    )

    return NextResponse.json({ success: true, id: result.lastInsertRowid })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

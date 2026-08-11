import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'
import { getSourcesForArea, AREA_LABELS } from '@/lib/legal-sources'
import { analyzeOpinion, hasAiKey } from '@/lib/ai'

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasAiKey()) {
    return NextResponse.json({
      error: 'ניתוח AI אינו מוגדר. יש להוסיף ANTHROPIC_API_KEY לקובץ .env.local ולהפעיל מחדש את השרת.',
    }, { status: 503 })
  }

  const { id } = await params
  const db = getDb()

  const profile = db.prepare(`
    SELECT lp.*, c.title as case_title, c.user_id
    FROM litigation_profiles lp
    JOIN cases c ON lp.case_id = c.id
    WHERE lp.id = ?
  `).get(id)
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { fileIds = [] } = await request.json().catch(() => ({}))

  const facts = profile.facts ? JSON.parse(profile.facts) : {}
  const sources = getSourcesForArea(profile.area)

  // קבצים לניתוח — רק מתוך תיק הלקוח, לפי הבחירה
  let files = []
  if (Array.isArray(fileIds) && fileIds.length) {
    const placeholders = fileIds.map(() => '?').join(',')
    files = db.prepare(
      `SELECT id, original_name, stored_name, mime_type FROM files
       WHERE id IN (${placeholders}) AND case_id = ?`
    ).all(...fileIds, profile.case_id)
  }

  try {
    const { analysis, skippedFiles, model } = await analyzeOpinion({
      role: profile.role,
      areaLabel: AREA_LABELS[profile.area] || profile.area,
      facts,
      opposingClaim: profile.opposing_claim || '',
      sources,
      files,
    })
    return NextResponse.json({ analysis, skippedFiles, model })
  } catch (err) {
    console.error('AI opinion error:', err)
    return NextResponse.json(
      { error: err?.message || 'שגיאה בניתוח ה-AI' },
      { status: 502 }
    )
  }
}

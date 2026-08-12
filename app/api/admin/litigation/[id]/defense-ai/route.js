import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'
import { getSourcesForArea, AREA_LABELS } from '@/lib/legal-sources'
import { draftDefense, clarifyQuestions, hasAiKey } from '@/lib/ai'

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
    SELECT lp.* FROM litigation_profiles lp WHERE lp.id = ?
  `).get(id)
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { fileIds = [], factsText, answers = [], mode } = await request.json().catch(() => ({}))
  const facts = profile.facts ? JSON.parse(profile.facts) : {}
  // גרסת/טענות הלקוח שהוזנו ישירות בפאנל — נשמרות בתיק ומשמשות בסיס לניסוח
  if (typeof factsText === 'string' && factsText.trim()) {
    facts.chronology = factsText.trim()
    db.prepare('UPDATE litigation_profiles SET facts = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(JSON.stringify(facts), id)
  }
  const sources = getSourcesForArea(profile.area)
  const opposingClaim = profile.opposing_claim || ''

  let files = []
  if (Array.isArray(fileIds) && fileIds.length) {
    const ph = fileIds.map(() => '?').join(',')
    files = db.prepare(
      `SELECT id, original_name, stored_name, mime_type FROM files WHERE id IN (${ph}) AND case_id = ?`
    ).all(...fileIds, profile.case_id)
  }

  const areaLabel = AREA_LABELS[profile.area] || profile.area

  try {
    if (mode === 'questions') {
      const { questions, skippedFiles, model } = await clarifyQuestions({
        kind: 'defense', areaLabel, facts, opposingClaim, sources, files,
      })
      return NextResponse.json({ questions, skippedFiles, model })
    }
    const { analysis, skippedFiles, model } = await draftDefense({
      areaLabel, facts, opposingClaim, sources, files, answers,
    })
    return NextResponse.json({ analysis, skippedFiles, model })
  } catch (err) {
    console.error('AI defense error:', err)
    return NextResponse.json({ error: err?.message || 'שגיאה בניתוח ה-AI' }, { status: 502 })
  }
}

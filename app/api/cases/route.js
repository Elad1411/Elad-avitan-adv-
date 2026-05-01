import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const cases = db.prepare(
    'SELECT * FROM cases WHERE user_id = ? ORDER BY updated_at DESC, created_at DESC'
  ).all(session.user.id)

  return NextResponse.json({ cases })
}

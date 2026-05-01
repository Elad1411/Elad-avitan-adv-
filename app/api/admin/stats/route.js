import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()
  const clients = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'client'").get().count
  const cases = db.prepare('SELECT COUNT(*) as count FROM cases').get().count
  const activeCases = db.prepare("SELECT COUNT(*) as count FROM cases WHERE status NOT IN ('סגור','זוכה','הורשע')").get().count
  const files = db.prepare('SELECT COUNT(*) as count FROM files').get().count

  return NextResponse.json({ clients, cases, activeCases, files })
}

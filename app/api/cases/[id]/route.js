import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getDb } from '@/lib/db'

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  let query = 'SELECT * FROM cases WHERE id = ?'
  const args = [params.id]

  if (session.user.role !== 'admin') {
    query += ' AND user_id = ?'
    args.push(session.user.id)
  }

  const c = db.prepare(query).get(...args)
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ case: c })
}

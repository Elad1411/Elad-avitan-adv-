import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getSourcesForArea, getSuggestedSourceIds, LEGAL_SOURCES } from '@/lib/legal-sources'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const area = searchParams.get('area')
  const docType = searchParams.get('docType') || ''

  let sources = area ? getSourcesForArea(area) : LEGAL_SOURCES
  // מסמכי שכ"ט נשענים גם על מקורות האתיקה ושכר הטרחה
  if (docType === 'fee_agreement') {
    const feeSources = LEGAL_SOURCES.filter(s => s.areas.includes('fees'))
    const ids = new Set(sources.map(s => s.id))
    sources = [...feeSources, ...sources.filter(s => !feeSources.some(f => f.id === s.id) && ids.has(s.id))]
  }

  return NextResponse.json({
    sources,
    suggested: getSuggestedSourceIds(area, docType),
  })
}

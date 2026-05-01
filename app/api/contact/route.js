import { NextResponse } from 'next/server'

export async function POST(request) {
  const { name, phone, email, message } = await request.json()

  if (!name || !phone || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  console.log('New contact form submission:', { name, phone, email, message: message.slice(0, 100) })

  return NextResponse.json({ success: true })
}

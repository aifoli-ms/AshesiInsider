import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, parseSessionToken } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value as string | undefined
  const session = token ? parseSessionToken(token) : null
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  return NextResponse.json({ authenticated: true, user: session }, { status: 200 })
}



import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { createSessionToken, ONE_WEEK_SECONDS } from '@/lib/session'
import { SESSION_COOKIE } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = (body.email ?? '').toLowerCase().trim()
    const password = body.password ?? ''

    if (!email || !password) {
      return NextResponse.json({ error: 'Fill in all required fields' }, { status: 400 })
    }

    if (!supabaseServer) {
      return NextResponse.json({ error: 'Database client not configured' }, { status: 500 })
    }

    // Use SECURITY DEFINER RPC to verify credentials (bcrypt via pgcrypto)
    const { data, error } = await supabaseServer.rpc('verify_user', {
      _email: email,
      _password: password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = Array.isArray(data) ? data : []
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = rows[0] as { id: number; first_name?: string; email: string; profile_type?: string }

    const token = createSessionToken({
      sub: user.id,
      email: user.email,
      firstName: user.first_name,
      profileType: user.profile_type,
    })

    const res = NextResponse.json({ user }, { status: 200 })
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ONE_WEEK_SECONDS,
    })
    return res
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 })
  }
}



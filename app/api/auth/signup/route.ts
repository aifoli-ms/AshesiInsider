import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { createSessionToken, ONE_WEEK_SECONDS, SESSION_COOKIE } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ProfileType = 'student' | 'faculty' | 'other'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const firstName = (body.firstName ?? '').trim()
    const lastName = (body.lastName ?? '').trim()
    const email = (body.email ?? '').toLowerCase().trim()
    const password = body.password ?? ''
    const profileType: ProfileType = body.profileType ?? 'student'

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Fill all required fields' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
    }

    if (!supabaseServer) {
      return NextResponse.json({ error: 'Database client not configured' }, { status: 500 })
    }

    // Use SECURITY DEFINER RPC to insert safely with server-side hashing
    const { data, error } = await supabaseServer.rpc('register_user', {
      _first_name: firstName,
      _last_name: lastName,
      _email: email,
      _password: password,
      _profile_type: profileType,
    })

    if (error) {
      const isDuplicate = /duplicate key value/i.test(error.message)
      return NextResponse.json(
        { error: isDuplicate ? 'User with this email already exists' : error.message },
        { status: isDuplicate ? 409 : 500 }
      )
    }

    const created = Array.isArray(data) ? data[0] : data

    const token = createSessionToken({
      sub: Number(created.id),
      email,
      firstName,
      profileType,
    })

    const res = NextResponse.json(
      {
        message: 'User created successfully',
        user: created,
      },
      { status: 201 }
    )
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



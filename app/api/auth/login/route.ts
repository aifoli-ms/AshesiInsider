//@Nigel Nortey

// Login API - Authenticates users and admins with rate limiting
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { createSessionToken, ONE_WEEK_SECONDS } from '@/lib/session'
import { SESSION_COOKIE } from '@/lib/session'
import { validateEmail } from '@/lib/validation'
import { RateLimiter } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Check rate limit (3 attempts, then 5 min lockout)
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { blocked, remaining, resetTime } = RateLimiter.check(ip)

    if (blocked) {
      const resetDate = resetTime ? new Date(resetTime) : new Date()
      return NextResponse.json(
        { error: `Too many attempts. Please try again after ${resetDate.toLocaleTimeString()}` },
        { status: 429 }
      )
    }

    // Parse and validate input
    const body = await req.json().catch(() => ({}))
    const emailInput = (body.email ?? '').toLowerCase().trim()
    const password = body.password ?? ''

    // Validate email format
    const emailValidation = validateEmail(emailInput)
    if (!emailValidation.isValid) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    const email = emailValidation.sanitized!

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    if (!supabaseServer) {
      return NextResponse.json({ error: 'Database client not configured' }, { status: 500 })
    }

    // 1. Try Admin Login (using verify_admin RPC)
    const { data: adminData, error: adminError } = await supabaseServer.rpc('verify_admin', {
      _email: email,
      _password: password,
    })

    if (!adminError && adminData && adminData.length > 0) {
      const admin = adminData[0];
      const token = createSessionToken({
        sub: admin.id, // This might be a UUID now
        email: admin.email,
        firstName: 'Admin',
        profileType: 'admin',
        role: 'admin',
      })

      const res = NextResponse.json({ user: { ...admin, role: 'admin' } }, { status: 200 })
      res.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: ONE_WEEK_SECONDS,
      })
      RateLimiter.reset(ip)
      return res
    }

    // 2. Try Regular User Login (using verify_user RPC)
    const { data, error } = await supabaseServer.rpc('verify_user', {
      _email: email,
      _password: password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = Array.isArray(data) ? data : []
    if (rows.length === 0) {
      RateLimiter.increment(ip)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = rows[0] as { id: number; first_name?: string; email: string; profile_type?: string }

    // Regular users have role 'user' (admins table is separate now)
    const role = 'user'

    const token = createSessionToken({
      sub: user.id,
      email: user.email,
      firstName: user.first_name,
      profileType: user.profile_type,
      role,
    })

    const res = NextResponse.json({ user }, { status: 200 })
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ONE_WEEK_SECONDS,
    })
    RateLimiter.reset(ip)
    return res
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 })
  }
}



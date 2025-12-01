//@Nigel Nortey

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { createSessionToken, ONE_WEEK_SECONDS, SESSION_COOKIE } from '@/lib/session'
import {
  validateEmail,
  sanitizeName,
  getPasswordErrorMessage
} from '@/lib/validation'

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

    // Validate first name
    const firstNameValidation = sanitizeName(firstName)
    if (!firstNameValidation.isValid) {
      return NextResponse.json({ error: firstNameValidation.error }, { status: 400 })
    }

    // Validate last name
    const lastNameValidation = sanitizeName(lastName)
    if (!lastNameValidation.isValid) {
      return NextResponse.json({ error: lastNameValidation.error }, { status: 400 })
    }

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }

    // Check password strength (8+ chars, uppercase, lowercase, number, special char)
    const passwordError = getPasswordErrorMessage(password)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    if (!supabaseServer) {
      return NextResponse.json({ error: 'Database client not configured' }, { status: 500 })
    }

    // Register user - password is hashed server-side via pgcrypto
    const { data, error } = await supabaseServer.rpc('register_user', {
      _first_name: firstNameValidation.sanitized!,
      _last_name: lastNameValidation.sanitized!,
      _email: emailValidation.sanitized!,
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

    // Create session token for auto-login after signup
    const token = createSessionToken({
      sub: Number(created.id),
      email: emailValidation.sanitized!,
      firstName: firstNameValidation.sanitized!,
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



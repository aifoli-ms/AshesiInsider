import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { supabase } from '@/lib/supabaseClient'

dotenv.config()

const router = express.Router()

type ProfileType = 'student' | 'faculty' | 'other'

interface SignUpBody {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  profileType?: ProfileType
}

router.post('/signup', async (req: Request<unknown, unknown, SignUpBody>, res: Response) => {
  try {
    const { firstName, lastName, email, password, profileType } = req.body ?? {}

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Fill all required fields' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' })
    }
    const emailLower = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailLower)) {
      return res.status(400).json({ error: 'Enter a valid email address' })
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Database client not configured' })
    }

    // check existing
    const { data: existing, error: checkErr } = await supabase
      .from('app_users')
      .select('id')
      .eq('email', emailLower)
      .single()

    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' })
    }
    if (checkErr && checkErr.code !== 'PGRST116') {
      return res.status(500).json({ error: checkErr.message })
    }

    // hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // insert
    const { data: created, error: insertErr } = await supabase
      .from('app_users')
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: emailLower,
        password_hash: passwordHash,
        profile_type: (profileType ?? 'student') as ProfileType,
      })
      .select('id, first_name, last_name, email, profile_type')
      .single()

    if (insertErr || !created) {
      return res.status(500).json({ error: insertErr?.message ?? 'Failed to create user' })
    }

    const token = jwt.sign(
      { sub: created.id, email: created.email, profileType: created.profile_type },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    )

    return res.status(201).json({
      message: 'User created successfully',
      user: created,
      token,
    })
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Internal server error' })
  }
})

export default router



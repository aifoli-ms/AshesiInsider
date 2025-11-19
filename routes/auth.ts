import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { supabase } from '@/lib/supabaseClient'

dotenv.config()

const router = express.Router()

interface LoginBody {
  email?: string
  password?: string
}

router.post('/login', async (req: Request<unknown, unknown, LoginBody>, res: Response) => {
  try {
    const { email, password } = req.body ?? {}
    if (!email || !password) {
      return res.status(400).json({ error: 'Fill in all required fields' })
    }
    const emailLower = email.toLowerCase().trim()

    if (!supabase) {
      return res.status(500).json({ error: 'Database client not configured' })
    }

    const { data: user, error } = await supabase
      .from('app_users')
      .select('id, first_name, last_name, email, password_hash, profile_type')
      .eq('email', emailLower)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, profileType: user.profile_type },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    )

    const { password_hash, ...safeUser } = user
    return res.status(200).json({ user: safeUser, token })
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? 'Internal server error' })
  }
})

export default router



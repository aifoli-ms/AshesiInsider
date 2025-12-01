//Nigel Nortey

// Rate Limiter - Prevents brute force attacks on login
type RateLimitRecord = {
    attempts: number
    lockoutUntil: number | null
}

const RATE_LIMIT_MAP = new Map<string, RateLimitRecord>()

const MAX_ATTEMPTS = 3
const LOCKOUT_TIME_MS = 5 * 60 * 1000 // 5 minutes

export class RateLimiter {
    /**
     * Checks if the key is currently blocked.
     * Returns the blocked status and remaining attempts (if not blocked).
     */
    static check(key: string): { blocked: boolean; remaining: number; resetTime?: number } {
        const record = RATE_LIMIT_MAP.get(key)

        if (!record) {
            return { blocked: false, remaining: MAX_ATTEMPTS }
        }

        if (record.lockoutUntil) {
            if (Date.now() < record.lockoutUntil) {
                return { blocked: true, remaining: 0, resetTime: record.lockoutUntil }
            }
            // Lockout expired
            RATE_LIMIT_MAP.delete(key)
            return { blocked: false, remaining: MAX_ATTEMPTS }
        }

        return { blocked: false, remaining: MAX_ATTEMPTS - record.attempts }
    }

    /**
     * Increments the attempt count for the key.
     * If attempts exceed MAX_ATTEMPTS, sets a lockout.
     */
    static increment(key: string): void {
        const record = RATE_LIMIT_MAP.get(key) || { attempts: 0, lockoutUntil: null }

        record.attempts += 1

        if (record.attempts >= MAX_ATTEMPTS) {
            record.lockoutUntil = Date.now() + LOCKOUT_TIME_MS
        }

        RATE_LIMIT_MAP.set(key, record)
    }

    /**
     * Resets the rate limit for the key (e.g., on successful login).
     */
    static reset(key: string): void {
        RATE_LIMIT_MAP.delete(key)
    }
}

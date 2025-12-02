'use client'
import type { AdminViewProps } from 'payload'
import React, { useCallback, useState, useEffect } from 'react'
import styles from './styles.module.css'
import Link from 'next/link'
import { logger } from '@/utils/logger'

const LoginView: React.FC<AdminViewProps> = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [requires2FA, setRequires2FA] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(null)

  const reset2FAState = useCallback(() => {
    setRequires2FA(false)
    setOtp('')
  }, [])

  // Handle countdown timer for rate limit errors
  useEffect(() => {
    if (retryAfterSeconds === null || retryAfterSeconds <= 0) {
      return
    }

    const interval = setInterval(() => {
      setRetryAfterSeconds((prev) => {
        if (prev === null || prev <= 1) {
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [retryAfterSeconds])

  const handleLogin = useCallback(async () => {
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Login failed')

      if (data?.requires2FA) {
        setRequires2FA(true)
        setOtp('')
        // send OTP immediately
        const sendRes = await fetch('/api/2fa/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const sendData = await sendRes.json()
        if (!sendRes.ok) {
          reset2FAState()
          throw new Error(sendData?.message || 'Failed to send OTP')
        }
        setInfo('Verification code sent to your email')
      } else {
        // Non-2FA path: token cookie is already set by Payload default login when used directly,
        // but here we received token via API. Redirect to admin.
        window.location.href = '/admin'
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Login failed'
      setError(errorMessage)
      reset2FAState()
    } finally {
      setLoading(false)
    }
  }, [email, password, reset2FAState])

  const handleVerify = useCallback(async () => {
    setLoading(true)
    setError(null)
    setRetryAfterSeconds(null)
    try {
      const res = await fetch('/api/2fa/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
        credentials: 'include', // Ensure cookies are sent and received
      })
      const data = await res.json()
      if (!res.ok) {
        // Check if this is a rate limit error with retryAfter
        if (res.status === 429 && data?.retryAfter) {
          setRetryAfterSeconds(data.retryAfter)
        }
        throw new Error(data?.message || 'Invalid code')
      }

      // Check if cookie was set (via response header)
      const authSet = res.headers.get('X-Auth-Set')
      logger.log(
        '[Login] OTP verified, auth set:',
        authSet,
        'Token:',
        data?.data?.token ? 'present' : 'missing',
      )

      // Small delay to ensure cookie is set before redirect
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Use full URL for redirect to ensure proper navigation
      const adminUrl = window.location.origin + '/admin'
      logger.log('[Login] Redirecting to:', adminUrl)

      // Force a hard redirect to ensure cookie is read
      window.location.href = adminUrl
    } catch (e: unknown) {
      logger.error('[Login] OTP verification error:', e)
      const errorMessage = e instanceof Error ? e.message : 'Verification failed'
      setError(errorMessage)
      setLoading(false)
    }
  }, [email, otp])

  const handleResend = useCallback(async () => {
    if (!email || resendCooldown > 0) return
    setResendLoading(true)
    setError(null)
    setInfo(null)
    setRetryAfterSeconds(null)
    try {
      const res = await fetch('/api/2fa/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to resend code')
      setInfo('New verification code sent to your email')
      setResendCooldown(30)
      const interval = setInterval(() => {
        setResendCooldown((t) => {
          if (t <= 1) {
            clearInterval(interval)
            return 0
          }
          return t - 1
        })
      }, 1000)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to resend code'
      setError(errorMessage)
    } finally {
      setResendLoading(false)
    }
  }, [email, resendCooldown])

  return (
    <div className={styles.screen}>
      <div className={styles.cardWrapper}>
        {!requires2FA ? (
          <form
            className={styles.card}
            onSubmit={(e) => {
              e.preventDefault()
              handleLogin()
            }}
          >
            <h1 className={styles.title}>Sign in</h1>

            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
              placeholder="you@example.com"
              autoComplete="username"
            />

            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Please wait…' : 'Login'}
            </button>

            <div className={styles.helperRow}>
              <Link className={styles.link} href="/admin/auth/reset-password">
                Forgot your password?
              </Link>
            </div>
          </form>
        ) : (
          <form
            className={styles.card}
            onSubmit={(e) => {
              e.preventDefault()
              handleVerify()
            }}
          >
            <h1 className={styles.title}>Verify code</h1>

            <label htmlFor="otp" className={styles.label}>
              Verification Code
            </label>
            <input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className={styles.input}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter 6-digit code"
              autoComplete="one-time-code"
            />
            {info && <div className={styles.info}>{info}</div>}
            {error && (
              <div className={styles.error}>
                {error}
                {retryAfterSeconds !== null && retryAfterSeconds > 0 && (
                  <span className={styles.countdown}> (Retry in {retryAfterSeconds}s)</span>
                )}
              </div>
            )}
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>

            <div className={styles.helperRow}>
              <span className={styles.muted}>Didn&apos;t get the code?</span>
              <button
                type="button"
                className={styles.linkButton}
                onClick={handleResend}
                disabled={resendLoading || resendCooldown > 0}
              >
                {resendLoading
                  ? 'Resending…'
                  : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default LoginView

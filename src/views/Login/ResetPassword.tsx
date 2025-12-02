'use client'
import React, { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './styles.module.css'
import Link from 'next/link'

const ResetPasswordView: React.FC = () => {
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get('token') || '', [searchParams])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const handleRequest = useCallback(async () => {
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to send reset link')
      setInfo('If the email exists, a reset link has been sent.')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to send reset link'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [email])

  const handleReset = useCallback(async () => {
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to reset password')
      setInfo('Password updated. You can now sign in.')
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 1000)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to reset password'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [token, password, confirm])

  return (
    <div className={styles.screen}>
      <div className={styles.cardWrapper}>
        {!token ? (
          <form
            className={styles.card}
            onSubmit={(e) => {
              e.preventDefault()
              handleRequest()
            }}
          >
            <h1 className={styles.title}>Forgot password</h1>
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
            {info && <div className={styles.info}>{info}</div>}
            {error && <div className={styles.error}>{error}</div>}
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <div className={styles.helperRow}>
              <Link className={styles.link} href="/admin/auth/login">
                Back to sign in
              </Link>
            </div>
          </form>
        ) : (
          <form
            className={styles.card}
            onSubmit={(e) => {
              e.preventDefault()
              handleReset()
            }}
          >
            <h1 className={styles.title}>Set new password</h1>
            <label htmlFor="password" className={styles.label}>
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <label htmlFor="confirm" className={styles.label}>
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className={styles.input}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {info && <div className={styles.info}>{info}</div>}
            {error && <div className={styles.error}>{error}</div>}
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Updating…' : 'Update password'}
            </button>
            <div className={styles.helperRow}>
              <Link className={styles.link} href="/admin/auth/login">
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordView

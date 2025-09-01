'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import '@/app/(frontend)/styles.css'

// Add CSS for spinner animation
const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

interface InviteData {
  email: string
  role?: string
  token: string
  expires: number
}

export default function AdminInvitePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // Add CSS for spinner animation
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = spinnerStyle
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    // Parse invite data from URL parameters
    const email = searchParams.get('email')
    const role = searchParams.get('role') || 'admin'
    const token = searchParams.get('token')
    const expires = searchParams.get('expires')

    if (!email || !token || !expires) {
      setError('Invalid invite link. Missing required parameters.')
      setLoading(false)
      return
    }

    // Check if invite has expired
    const expirationTime = parseInt(expires)
    if (Date.now() > expirationTime) {
      setError('This invite link has expired. Please request a new one.')
      setLoading(false)
      return
    }

    setInviteData({
      email,
      role,
      token,
      expires: expirationTime,
    })
    setLoading(false)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteData) return

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/accept-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteData.email,
          role: inviteData.role,
          token: inviteData.token,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account')
      }

      // Redirect to admin panel
      router.push('/admin?message=Account created successfully! Please log in.')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto',
            }}
          ></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading invite...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '400px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '24px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '48px',
                width: '48px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
              }}
            >
              <svg
                style={{ height: '24px', width: '24px', color: '#dc2626' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2
              style={{ marginTop: '16px', fontSize: '18px', fontWeight: '500', color: '#111827' }}
            >
              Invite Error
            </h2>
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>{error}</p>
            <div style={{ marginTop: '24px' }}>
              <button
                onClick={() => router.push('/')}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '8px 16px',
                  border: '1px solid transparent',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#2563eb',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        padding: '48px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              margin: '0 auto',
              height: '48px',
              width: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: '#dbeafe',
            }}
          >
            <svg
              style={{ height: '32px', width: '32px', color: '#2563eb' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2
            style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '30px',
              fontWeight: '800',
              color: '#111827',
            }}
          >
            Complete Your Profile
          </h2>
          <p
            style={{
              marginTop: '8px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#6b7280',
            }}
          >
            You've been invited to join JCL CMS as a {inviteData?.role}
          </p>
          <p
            style={{
              marginTop: '4px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#9ca3af',
            }}
          >
            {inviteData?.email}
          </p>
        </div>

        <form style={{ marginTop: '32px' }} onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px',
              }}
            >
              <div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <input
                id="password"
                name="password"
                type="password"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                }}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                }}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                borderRadius: '6px',
                backgroundColor: '#fef2f2',
                padding: '16px',
                marginBottom: '24px',
                border: '1px solid #fecaca',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: '12px' }}>
                  <svg
                    style={{ height: '20px', width: '20px', color: '#f87171' }}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#991b1b' }}>{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '8px 16px',
                border: '1px solid transparent',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: submitting ? '#9ca3af' : '#2563eb',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.5 : 1,
              }}
              onMouseOver={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8'
                }
              }}
              onMouseOut={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                }
              }}
            >
              {submitting ? (
                <>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '12px',
                    }}
                  ></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { TwoFactorVerification } from './TwoFactorVerification'

interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectTo = '/admin' }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [message, setMessage] = useState('')

  const { signIn, resetPassword, loading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (!email || !password) {
      setMessage('Please fill in all fields')
      return
    }

    const result = await signIn(email, password)

    if (result.success) {
      setMessage('Login successful!')
      if (onSuccess) {
        onSuccess()
      } else {
        window.location.href = redirectTo
      }
    } else if (result.twoFactorRequired) {
      setShowTwoFactor(true)
    } else {
      setMessage(result.error || 'Login failed')
    }
  }

  const handleTwoFactorSuccess = () => {
    setShowTwoFactor(false)
    setMessage('Login successful!')
    if (onSuccess) {
      onSuccess()
    } else {
      window.location.href = redirectTo
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resetEmail) {
      setMessage('Please enter your email address')
      return
    }

    const result = await resetPassword(resetEmail)

    if (result.success) {
      setMessage(result.message || 'Password reset email sent')
      setShowForgotPassword(false)
      setResetEmail('')
    } else {
      setMessage(result.error || 'Failed to send reset email')
    }
  }

  if (showTwoFactor) {
    return (
      <TwoFactorVerification
        onSuccess={handleTwoFactorSuccess}
        onCancel={() => setShowTwoFactor(false)}
      />
    )
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label htmlFor="reset-email" className="sr-only">
                Email address
              </label>
              <input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            {message && (
              <div
                className={`text-sm text-center ${
                  message.includes('sent') || message.includes('successful')
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {message}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false)
                  setMessage('')
                  setResetEmail('')
                }}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to JCL CMS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your content management system
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {(message || error) && (
            <div
              className={`text-sm text-center ${
                message?.includes('successful') || message?.includes('sent')
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {message || error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

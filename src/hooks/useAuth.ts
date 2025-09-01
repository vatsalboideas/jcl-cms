'use client'

import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth/client'

export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role?: string
  twoFactorEnabled?: boolean
  emailVerified?: boolean
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    setAuthState({
      user: session?.user || null,
      loading: isPending,
      error: null,
    })
  }, [session, isPending])

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }))

      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: result.error.message || 'Sign in failed',
        }))
        return { success: false, error: result.error.message }
      }

      // Check if 2FA is required
      if (result.data?.twoFactorRequired) {
        return {
          success: false,
          twoFactorRequired: true,
          message: 'Two-factor authentication required',
        }
      }

      setAuthState((prev) => ({
        ...prev,
        user: result.data?.user || null,
        loading: false,
      }))

      return { success: true, user: result.data?.user }
    } catch (error: any) {
      const errorMessage = error.message || 'Sign in failed'
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }))

      const result = await authClient.signUp.email({
        email,
        password,
        name: firstName ? `${firstName} ${lastName || ''}`.trim() : undefined,
      })

      if (result.error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: result.error.message || 'Sign up failed',
        }))
        return { success: false, error: result.error.message }
      }

      setAuthState((prev) => ({
        ...prev,
        user: result.data?.user || null,
        loading: false,
      }))

      return {
        success: true,
        user: result.data?.user,
        message: 'Account created successfully. Please check your email to verify your account.',
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Sign up failed'
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const signOut = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }))

      await authClient.signOut()

      setAuthState({
        user: null,
        loading: false,
        error: null,
      })

      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Sign out failed'
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const verifyTwoFactor = async (code: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }))

      const result = await authClient.twoFactor.verifyTotp({ code })

      if (result.error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: result.error.message || 'Verification failed',
        }))
        return { success: false, error: result.error.message }
      }

      setAuthState((prev) => ({
        ...prev,
        user: result.data?.user || null,
        loading: false,
      }))

      return { success: true, user: result.data?.user }
    } catch (error: any) {
      const errorMessage = error.message || 'Verification failed'
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const useBackupCode = async (code: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }))

      const result = await authClient.twoFactor.useBackupCode({ code })

      if (result.error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: result.error.message || 'Backup code verification failed',
        }))
        return { success: false, error: result.error.message }
      }

      setAuthState((prev) => ({
        ...prev,
        user: result.data?.user || null,
        loading: false,
      }))

      return { success: true, user: result.data?.user }
    } catch (error: any) {
      const errorMessage = error.message || 'Backup code verification failed'
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }))

      const result = await authClient.forgetPassword({ email })

      setAuthState((prev) => ({ ...prev, loading: false }))

      if (result.error) {
        return { success: false, error: result.error.message }
      }

      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Password reset failed'
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    verifyTwoFactor,
    useBackupCode,
    resetPassword,
  }
}

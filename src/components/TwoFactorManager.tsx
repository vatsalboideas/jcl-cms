'use client'

import React, { useState } from 'react'
import { authClient } from '@/lib/auth/client'
import { TwoFactorSetup } from './TwoFactorSetup'

interface TwoFactorManagerProps {
  user: any
}

export const TwoFactorManager: React.FC<TwoFactorManagerProps> = ({ user }) => {
  const [showSetup, setShowSetup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const disableTwoFactor = async () => {
    if (
      !confirm(
        'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
      )
    ) {
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await authClient.twoFactor.disable()

      if (response.error) {
        setError('Failed to disable 2FA. Please try again.')
      } else {
        // Refresh the page or update the user state
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const regenerateBackupCodes = async () => {
    if (!confirm('This will invalidate your existing backup codes. Are you sure?')) {
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await authClient.twoFactor.getBackupCodes()

      if (response.data) {
        // Download new backup codes
        const codesText = response.data.codes.join('\n')
        const blob = new Blob([codesText], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'jcl-cms-new-backup-codes.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        setError('Failed to generate new backup codes')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate backup codes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {user.twoFactorEnabled ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-700 font-medium">Two-factor authentication is enabled</span>
          </div>

          <p className="text-gray-600">
            Your account is protected with two-factor authentication. You'll need to enter a code
            from your authenticator app when signing in.
          </p>

          <div className="flex space-x-3">
            <button
              onClick={regenerateBackupCodes}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Generating...' : 'Generate New Backup Codes'}
            </button>

            <button
              onClick={disableTwoFactor}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Disabling...' : 'Disable 2FA'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-700 font-medium">
              Two-factor authentication is disabled
            </span>
          </div>

          <p className="text-gray-600">
            Add an extra layer of security to your account by enabling two-factor authentication.
            You'll need an authenticator app like Google Authenticator or Authy.
          </p>

          <button
            onClick={() => setShowSetup(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Enable Two-Factor Authentication
          </button>
        </div>
      )}

      {showSetup && (
        <TwoFactorSetup
          user={user}
          onClose={() => {
            setShowSetup(false)
            // Optionally refresh user data
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { authClient } from '@/lib/auth/client'

interface TwoFactorVerificationProps {
  onSuccess: () => void
  onCancel: () => void
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [code, setCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerification = async () => {
    if (!code || code.length < 6) {
      setError('Please enter a valid code')
      return
    }

    try {
      setLoading(true)
      setError('')

      let response

      if (useBackupCode) {
        // Use backup code
        response = await authClient.twoFactor.useBackupCode({
          code: code,
        })
      } else {
        // Use TOTP code
        response = await authClient.twoFactor.verifyTotp({
          code: code,
        })
      }

      if (response.error) {
        setError(useBackupCode ? 'Invalid backup code' : 'Invalid verification code')
      } else {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerification()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">Two-Factor Authentication</h2>
          <p className="text-gray-600">
            {useBackupCode
              ? 'Enter one of your backup codes'
              : 'Enter the 6-digit code from your authenticator app'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = useBackupCode
                  ? e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)
                  : e.target.value.replace(/\D/g, '').slice(0, 6)
                setCode(value)
              }}
              onKeyPress={handleKeyPress}
              placeholder={useBackupCode ? 'Backup code' : '000000'}
              className="w-full text-center text-xl font-mono border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={useBackupCode ? 8 : 6}
              autoFocus
            />
          </div>

          {error && <div className="text-red-600 text-sm text-center">{error}</div>}

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVerification}
              disabled={loading || !code || (useBackupCode ? code.length < 6 : code.length !== 6)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setUseBackupCode(!useBackupCode)
                setCode('')
                setError('')
              }}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              {useBackupCode ? 'Use authenticator app instead' : 'Use a backup code instead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

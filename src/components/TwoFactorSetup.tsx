'use client'

import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode.react'
import { authClient } from '@/lib/auth/client'

interface TwoFactorSetupProps {
  user: any
  onClose?: () => void
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ user, onClose }) => {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup-codes' | 'success'>('setup')
  const [qrCodeUri, setQrCodeUri] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (step === 'setup') {
      generateQRCode()
    }
  }, [step])

  const generateQRCode = async () => {
    try {
      setLoading(true)
      const response = await authClient.twoFactor.getTotpUri()

      if (response.data) {
        setQrCodeUri(response.data.totpUri)
        setSecret(response.data.secret)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }

  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Verify the TOTP code
      const verifyResponse = await authClient.twoFactor.verifyTotp({
        code: verificationCode,
      })

      if (verifyResponse.error) {
        setError('Invalid verification code. Please try again.')
        return
      }

      // Enable 2FA
      const enableResponse = await authClient.twoFactor.enable({
        password: '', // You might need to ask for password confirmation
      })

      if (enableResponse.error) {
        setError('Failed to enable 2FA. Please try again.')
        return
      }

      // Get backup codes
      const backupResponse = await authClient.twoFactor.getBackupCodes()
      if (backupResponse.data) {
        setBackupCodes(backupResponse.data.codes)
        setStep('backup-codes')
      } else {
        setStep('success')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to enable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    const blob = new Blob([codesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'jcl-cms-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderSetupStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Set up Two-Factor Authentication</h3>
        <p className="text-gray-600 mb-4">
          Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : qrCodeUri ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <QRCode value={qrCodeUri} size={200} />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Can't scan? Enter this code manually:</p>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{secret}</code>
          </div>

          <button
            onClick={() => setStep('verify')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            I've Added the Account
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-red-600">Failed to generate QR code. Please try again.</p>
          <button
            onClick={generateQRCode}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )

  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Verify Your Setup</h3>
        <p className="text-gray-600 mb-4">Enter the 6-digit code from your authenticator app</p>
      </div>

      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="w-full text-center text-2xl font-mono border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={6}
          />
        </div>

        {error && <div className="text-red-600 text-sm text-center">{error}</div>}

        <div className="flex space-x-3">
          <button
            onClick={() => setStep('setup')}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Back
          </button>
          <button
            onClick={verifyAndEnable}
            disabled={loading || verificationCode.length !== 6}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify & Enable'}
          </button>
        </div>
      </div>
    </div>
  )

  const renderBackupCodesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Save Your Backup Codes</h3>
        <p className="text-gray-600 mb-4">
          Store these backup codes in a safe place. You can use them to access your account if you
          lose your authenticator device.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
          {backupCodes.map((code, index) => (
            <div key={index} className="bg-white p-2 rounded border text-center">
              {code}
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={downloadBackupCodes}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Download Codes
        </button>
        <button
          onClick={() => setStep('success')}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          I've Saved Them
        </button>
      </div>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="text-green-600 text-6xl">✓</div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication Enabled!</h3>
        <p className="text-gray-600 mb-4">
          Your account is now protected with two-factor authentication.
        </p>
      </div>
      <button
        onClick={onClose}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Done
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {step === 'setup' && renderSetupStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'backup-codes' && renderBackupCodesStep()}
        {step === 'success' && renderSuccessStep()}

        {step !== 'success' && (
          <div className="mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

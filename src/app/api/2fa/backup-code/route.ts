import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { TwoFactorAuth } from '@/utils/TwoFactorAuth'

export async function POST(req: NextRequest) {
  try {
    const { email, backupCode } = await req.json()

    if (!email || !backupCode) {
      return NextResponse.json(
        { success: false, message: 'Email and backup code are required' },
        { status: 400 },
      )
    }

    // Validate backup code format
    if (!TwoFactorAuth.validateBackupCodeFormat(backupCode)) {
      return NextResponse.json(
        { success: false, message: 'Invalid backup code format' },
        { status: 400 },
      )
    }

    // Find the user
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    if (!users.docs.length) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const user = users.docs[0]

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { success: false, message: '2FA is not enabled for this user' },
        { status: 400 },
      )
    }

    // Check if user has backup codes
    if (!user.twoFactorBackupCodes || user.twoFactorBackupCodes.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No backup codes found' },
        { status: 400 },
      )
    }

    // Normalize backup codes to match expected type (filter out null/undefined codes)
    const normalizedBackupCodes: Array<{ code: string; used: boolean }> = user.twoFactorBackupCodes
      .filter(
        (bc): bc is { code: string; used: boolean; id?: string | null } =>
          bc.code != null && bc.code !== undefined && typeof bc.code === 'string',
      )
      .map((bc) => ({
        code: bc.code!,
        used: bc.used ?? false,
      }))

    // Verify backup code
    const isValid = TwoFactorAuth.verifyBackupCode(backupCode, normalizedBackupCodes)

    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Invalid backup code' }, { status: 400 })
    }

    // Mark backup code as used
    const updatedBackupCodes = TwoFactorAuth.markBackupCodeAsUsed(backupCode, normalizedBackupCodes)

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        twoFactorBackupCodes: updatedBackupCodes,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Backup code verified successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    })
  } catch (error) {
    console.error('Backup code verification error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

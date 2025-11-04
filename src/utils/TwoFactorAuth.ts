import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import crypto from 'crypto'

export interface TwoFactorConfig {
  issuer: string
  label: string
}

export interface OTPResult {
  success: boolean
  message: string
  data?: any
}

export class TwoFactorAuth {
  private static readonly OTP_LENGTH = 6
  private static readonly OTP_EXPIRY_MINUTES = 10
  private static readonly BACKUP_CODES_COUNT = 10
  private static readonly BACKUP_CODE_LENGTH = 8

  /**
   * Generate a new 2FA secret for a user
   */
  static generateSecret(userEmail: string, config: TwoFactorConfig): string {
    return speakeasy.generateSecret({
      name: `${config.label} (${userEmail})`,
      issuer: config.issuer,
      length: 32,
    }).base32
  }

  /**
   * Generate QR code URL for 2FA setup
   */
  static async generateQRCode(
    secret: string,
    userEmail: string,
    config: TwoFactorConfig,
  ): Promise<string> {
    const otpauth = speakeasy.otpauthURL({
      secret,
      label: `${config.label} (${userEmail})`,
      issuer: config.issuer,
      algorithm: 'sha1',
      digits: 6,
      period: 30,
    })

    return await qrcode.toDataURL(otpauth)
  }

  /**
   * Verify a TOTP token
   */
  static verifyToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (60 seconds) of tolerance
    })
  }

  /**
   * Generate a random OTP for email verification
   */
  static generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString()
  }

  /**
   * Generate backup codes for 2FA recovery
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
      codes.push(crypto.randomBytes(this.BACKUP_CODE_LENGTH).toString('hex').toUpperCase())
    }
    return codes
  }

  /**
   * Verify a backup code
   */
  static verifyBackupCode(
    code: string,
    backupCodes: Array<{ code: string; used: boolean }>,
  ): boolean {
    const backupCode = backupCodes.find((bc) => bc.code === code && !bc.used)
    return !!backupCode
  }

  /**
   * Mark a backup code as used
   */
  static markBackupCodeAsUsed(
    code: string,
    backupCodes: Array<{ code: string; used: boolean }>,
  ): Array<{ code: string; used: boolean }> {
    return backupCodes.map((bc) => (bc.code === code ? { ...bc, used: true } : bc))
  }

  /**
   * Check if OTP is expired
   */
  static isOTPExpired(expiresAt: Date | string): boolean {
    return new Date() > new Date(expiresAt)
  }

  /**
   * Generate OTP expiry time
   */
  static generateOTPExpiry(): Date {
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + this.OTP_EXPIRY_MINUTES)
    return expiry
  }

  /**
   * Format backup codes for display
   */
  static formatBackupCodes(codes: string[]): string {
    return codes.map((code, index) => `${index + 1}. ${code}`).join('\n')
  }

  /**
   * Validate OTP format
   */
  static validateOTPFormat(otp: string): boolean {
    return /^\d{6}$/.test(otp)
  }

  /**
   * Validate backup code format
   */
  static validateBackupCodeFormat(code: string): boolean {
    return /^[A-F0-9]{16}$/.test(code)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: 'Token and new password are required' },
        { status: 400 },
      )
    }

    const payloadClient = await getPayload({ config: await configPromise })
    await payloadClient.resetPassword({
      collection: 'users',
      data: { token, password },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, message: 'Password has been reset' })
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : 'Failed to reset password'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

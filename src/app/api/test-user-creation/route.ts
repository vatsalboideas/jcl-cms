import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test user creation endpoint called')

    const body = await request.json()
    const { email, name, role } = body

    if (!email || !name || !role) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['email', 'name', 'role'],
          received: { email, name, role },
        },
        { status: 400 },
      )
    }

    const payload = await getPayload()

    console.log('📝 Testing user creation with data:', { email, name, role })

    const newUser = await payload.create({
      collection: 'users',
      data: {
        email,
        name,
        role,
        emailVerified: true,
      },
    })

    console.log('✅ Test user created successfully:', newUser.id)

    // Clean up - delete the test user
    await payload.delete({
      collection: 'users',
      id: newUser.id,
    })

    console.log('🧹 Test user cleaned up')

    return NextResponse.json({
      success: true,
      message: 'User creation test passed',
      userId: newUser.id,
      note: 'Test user was created and then deleted',
    })
  } catch (error: any) {
    console.error('❌ Test user creation failed:', error)

    return NextResponse.json(
      {
        error: 'User creation test failed',
        details: error.message || 'Unknown error occurred',
        validationErrors: error.errors || null,
        status: error.status || 500,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test user creation endpoint',
    usage: 'POST with { "email": "test@example.com", "name": "Test User", "role": "user" }',
    description: 'This endpoint tests if user creation works correctly with Better Auth plugin',
    note: 'Test users are automatically deleted after creation to keep the database clean',
  })
}

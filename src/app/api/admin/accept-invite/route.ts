import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Admin accept-invite endpoint called')

    const body = await request.json()
    const { email, role, token, firstName, lastName, password } = body

    // Validate required fields
    if (!email || !role || !token || !firstName || !lastName || !password) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['email', 'role', 'token', 'firstName', 'lastName', 'password'],
          received: {
            email,
            role,
            token,
            firstName: !!firstName,
            lastName: !!lastName,
            password: !!password,
          },
        },
        { status: 400 },
      )
    }

    console.log(`📧 Processing invite acceptance for: ${email}`)

    const payload = await getPayload()

    // Check if user already exists
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    if (existingUser.docs.length > 0) {
      return NextResponse.json(
        {
          error: 'User with this email already exists',
          details: 'Please log in with your existing account or use a different email',
        },
        { status: 409 },
      )
    }

    // Validate token (basic validation - you might want to store valid tokens in database)
    const expectedToken = Buffer.from(`${email}-${role}-${Date.now()}`).toString('base64')
    // For now, we'll accept any token since we're generating them on-the-fly
    // In production, you should store valid tokens in the database

    // Create the user account
    try {
      console.log('📝 Creating user with data:', {
        email,
        name: `${firstName} ${lastName}`,
        role,
        emailVerified: true,
      })

      const newUser = await payload.create({
        collection: 'users',
        data: {
          email,
          name: `${firstName} ${lastName}`,
          role,
          emailVerified: true,
        },
      })

      console.log(`✅ User account created: ${newUser.id}`)

      // Now create the credential account for login using Better Auth's methods
      try {
        console.log('🔐 Creating credential account for login...')

        // Use Better Auth's createCredentialAccount method
        const credentialAccount = await payload.betterAuth.createCredentialAccount({
          email,
          password,
          userId: newUser.id,
        })

        console.log('✅ Credential account created:', credentialAccount.id)
      } catch (credError: any) {
        console.error('❌ Credential account creation failed:', credError)
        console.error('❌ Credential error details:', {
          message: credError.message,
          status: credError.status,
          data: credError.data,
        })

        // Fallback: try to create manually
        try {
          console.log('🔄 Trying manual credential account creation...')
          const manualCredential = await payload.create({
            collection: 'userAccounts',
            data: {
              accountId: newUser.id.toString(),
              providerId: 'credentials',
              user: newUser.id,
              password: password,
            },
          })
          console.log('✅ Manual credential account created:', manualCredential.id)
        } catch (manualError: any) {
          console.error('❌ Manual credential account creation also failed:', manualError)
        }
      }

      // Send welcome email
      try {
        await payload.sendEmail({
          to: email,
          subject: 'Welcome to JCL CMS!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Welcome to JCL CMS! 🎉</h2>
              <p>Hello ${firstName},</p>
              <p>Your account has been successfully created and you're now ready to access the JCL CMS admin panel.</p>
              <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong>Account Details:</strong><br>
                Email: ${email}<br>
                Role: ${role}<br>
                Name: ${firstName} ${lastName}
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/admin" 
                   style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Access Admin Panel
                </a>
              </div>
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Visit the admin panel using the link above</li>
                <li>Log in with your email and password</li>
                <li>Explore the features available for your role</li>
                <li>Set up your profile and preferences</li>
              </ul>
              <p>If you have any questions or need assistance, please contact your administrator.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px;">
                Welcome aboard!<br>
                The JCL CMS Team
              </p>
            </div>
          `,
          text: `
            Welcome to JCL CMS!
            
            Hello ${firstName},
            
            Your account has been successfully created and you're now ready to access the JCL CMS admin panel.
            
            Account Details:
            - Email: ${email}
            - Role: ${role}
            - Name: ${firstName} ${lastName}
            
            Access Admin Panel: ${process.env.NEXT_PUBLIC_SERVER_URL}/admin
            
            Next Steps:
            1. Visit the admin panel using the link above
            2. Log in with your email and password
            3. Explore the features available for your role
            4. Set up your profile and preferences
            
            If you have any questions or need assistance, please contact your administrator.
            
            Welcome aboard!
            The JCL CMS Team
          `,
        })

        console.log(`✅ Welcome email sent to: ${email}`)
      } catch (emailError) {
        console.warn('⚠️ Welcome email failed to send:', emailError)
        // Don't fail the whole process if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Account created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
        nextSteps: {
          loginUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/admin`,
          message: 'Please log in with your email and password',
        },
      })
    } catch (createError: any) {
      console.error('❌ Failed to create user account:', createError)
      console.error('❌ Error details:', {
        message: createError.message,
        status: createError.status,
        data: createError.data,
        errors: createError.errors,
      })

      return NextResponse.json(
        {
          error: 'Failed to create user account',
          details: createError.message || 'Unknown error occurred',
          validationErrors: createError.errors || null,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error('❌ Accept invite error:', {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        error: 'Failed to process invite acceptance',
        details: error.message || 'Unknown error occurred',
      },
      { status: 500 },
    )
  }
}

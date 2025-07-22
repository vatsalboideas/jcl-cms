import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { jwtMiddleware } from '@/utils/jwtMiddleware'

export const GET = async (request: Request) => {
  // Run JWT middleware
  const user = await jwtMiddleware(request)

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  return Response.json({
    message: 'Authenticated!',
    user,
  })
}

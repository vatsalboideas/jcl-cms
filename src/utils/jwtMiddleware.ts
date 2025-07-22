import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret'

export async function jwtMiddleware(request: Request): Promise<any> {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const user = jwt.verify(token, JWT_SECRET)
      return user
    } catch (err) {
      return null
    }
  }
  return null
}

import jwt from 'jsonwebtoken'
import { Access } from 'payload'

const JWT_SECRET = process.env.JWT_SECRET || 'zujy^M*Jq2c1ToLJNP/l8$=t5d\~@8M&IW%1iEVIw$bLQ*A!z'

export const hasValidJWT: Access = ({ req }) => {
  const authHeader = req.headers?.get('authorization') || req.headers?.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    console.log('JWT verified start', token)
    try {
      jwt.verify(token, JWT_SECRET)
      console.log('JWT verified')
      return true
    } catch (err) {
      if (err && typeof err === 'object' && 'name' in err && 'message' in err) {
        console.log('JWT verified error:', (err as Error).name, (err as Error).message)
      } else {
        console.log('JWT verified error:', err)
      }
      return false
    }
  }
  return false
}

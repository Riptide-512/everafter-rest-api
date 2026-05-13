import { verifyAccessToken } from '../utils/auth.js'
import { sendError } from '../utils/response.js'

export async function authenticate(c, next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(
      c,
      401,
      'UNAUTHORIZED',
      'Missing or invalid Authorization header',
    )
  }

  const token = authHeader.slice(7)

  try {
    const jwtSecret =
      c.env.JWT_SECRET ??
      c.env.JWT_Secret ??
      c.env.jwt_secret ??
      c.env.JwtSecret

    const payload = await verifyAccessToken(token, jwtSecret)
    c.set('user', payload)
    await next()
  } catch (error) {
    return sendError(c, 401, 'UNAUTHORIZED', 'Invalid or expired access token.')
  }
}

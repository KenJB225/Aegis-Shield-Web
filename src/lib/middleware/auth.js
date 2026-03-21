import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key',
)

export async function verifyAuth(token) {
  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload
  } catch {
    return null
  }
}

export function withAuth(handler) {
  return async (request, context) => {
    const token = request.headers.get('authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAuth(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    return handler(request, context, payload)
  }
}

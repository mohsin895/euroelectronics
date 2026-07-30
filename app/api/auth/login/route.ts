import { NextRequest, NextResponse } from 'next/server'
import users from '@/lib/data/users.json'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user in dummy data
    const user = users.find((u) => u.email === email)

    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate a simple JWT-like token (in production, use proper JWT)
    const token = Buffer.from(
      JSON.stringify({
        id: user.id,
        email: user.email,
        iat: Date.now(),
      })
    ).toString('base64')

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('[v0] Auth login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

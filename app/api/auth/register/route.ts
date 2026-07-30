import { NextRequest, NextResponse } from 'next/server'
import users from '@/lib/data/users.json'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, address } = await request.json()

    if (!name || !email || !password || !phone || !address) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      )
    }

    // Create new user (in dummy data, we just simulate this)
    const newUser = {
      id: Math.max(...users.map((u) => u.id)) + 1,
      name,
      email,
      password,
      phone,
      role: 'customer' as const,
      address,
      createdAt: new Date().toISOString(),
    }

    // Generate token
    const token = Buffer.from(
      JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        iat: Date.now(),
      })
    ).toString('base64')

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      {
        token,
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Auth register error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

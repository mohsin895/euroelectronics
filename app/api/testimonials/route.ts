import { NextResponse } from 'next/server'
import testimonials from '@/lib/data/testimonials.json'

export async function GET() {
  try {
    return NextResponse.json({
      testimonials,
    })
  } catch (error) {
    console.error('[v0] Testimonials API error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch testimonials' },
      { status: 500 }
    )
  }
}

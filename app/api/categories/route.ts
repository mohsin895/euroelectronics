import { NextResponse } from 'next/server'
import categories from '@/lib/data/categories.json'

export async function GET() {
  try {
    return NextResponse.json({
      categories,
    })
  } catch (error) {
    console.error('[v0] Categories API error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

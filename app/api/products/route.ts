import { NextRequest, NextResponse } from 'next/server'
import products from '@/lib/data/products.json'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort')
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    let filtered = [...products]

    // Filter by category
    if (category) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      )
    }

    // Search by name or description
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      )
    }

    // Sort
    if (sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (sort === 'newest') {
      filtered.reverse()
    }

    // Limit results
    filtered = filtered.slice(0, limit)

    return NextResponse.json({
      products: filtered,
      total: filtered.length,
    })
  } catch (error) {
    console.error('[v0] Products API error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import products from '@/lib/data/products.json'
import reviews from '@/lib/data/reviews.json'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10)
    const product = products.find((p) => p.id === id)

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    // Get reviews for this product
    const productReviews = reviews.filter((r) => r.productId === id)

    return NextResponse.json({
      product,
      reviews: productReviews,
    })
  } catch (error) {
    console.error('[v0] Product detail API error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

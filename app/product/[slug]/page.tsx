'use client'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import Image from 'next/image'
import { use, useEffect, useState } from 'react'
import { ShoppingCart, Heart, Share2, ShieldCheck, Clock } from 'lucide-react'
import { fetchProductDetails, type UiProductDetail } from '@/lib/products'

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const { addItem } = useCart()
    const [product, setProduct] = useState<UiProductDetail | null>(null)
    const [activeImage, setActiveImage] = useState<string | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [addedToCart, setAddedToCart] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        setNotFound(false)

        fetchProductDetails(slug)
            .then((data) => {
                setProduct(data)
                setActiveImage(data.mainImage)
            })
            .catch((err) => {
                console.error('[ProductDetailPage] Failed to fetch product:', err)
                if (err instanceof Error && err.message === 'NOT_FOUND') {
                    setNotFound(true)
                }
            })
            .finally(() => setIsLoading(false))
    }, [slug])

    const handleAddToCart = () => {
        if (!product) return
        addItem({
            id: product.id,
            name: product.name,
            price: product.discount.finalPrice,
            quantity,
            image: product.mainImage,
            stock: 99, // TODO: swap in real stock once the API exposes it
        })
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 2000)
    }

    if (isLoading) {
        return (
            <>
                <Header />
                <main className="min-h-screen flex items-center justify-center">
                    <p className="text-muted-foreground">Loading product...</p>
                </main>
                <Footer />
            </>
        )
    }

    if (notFound || !product) {
        return (
            <>
                <Header />
                <main className="min-h-screen flex items-center justify-center">
                    <p className="text-muted-foreground">Product not found</p>
                </main>
                <Footer />
            </>
        )
    }

    const gallery = [product.mainImage, ...product.images.filter((img) => img !== product.mainImage)]
    const { discount } = product

    return (
        <>
            <Header />
            <main className="min-h-screen">
                {/* Breadcrumb */}
                <div className="px-4 md:px-6 py-4 bg-white border-b border-border">
                    <div className="max-w-7xl mx-auto">
                        <Link href="/" className="text-muted-foreground hover:text-primary">
                            Home
                        </Link>
                        <span className="text-muted-foreground"> / </span>
                        <Link href="/shop" className="text-muted-foreground hover:text-primary">
                            Products
                        </Link>
                        <span className="text-muted-foreground"> / {product.name}</span>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        {/* Gallery */}
                        <div className="flex flex-col p-5 gap-4">
                            <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
                                <Image
                                    src={activeImage || product.mainImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {gallery.length > 1 && (
                                <div className="flex gap-3  p-5">
                                    {gallery.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(img)}
                                            className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                                                activeImage === img ? 'border-primary' : 'border-transparent'
                                            }`}
                                        >
                                            <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div>
                            <div className="mb-4">
                                <span className="text-sm text-muted-foreground">{product.category}</span>
                                <h1 className="text-3xl font-bold text-foreground mt-2">{product.name}</h1>
                                {product.brand && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Brand: <span className="font-medium text-foreground">{product.brand}</span>
                                    </p>
                                )}
                            </div>

                            {/* Price */}
                            <div className="mb-6 pb-6 border-b border-border">
                                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl font-bold text-primary">
                    ৳{discount.finalPrice.toLocaleString()}
                  </span>
                                    {discount.isActive && (
                                        <span className="text-xl text-muted-foreground line-through">
                      ৳{discount.originalPrice.toLocaleString()}
                    </span>
                                    )}
                                    {discount.isActive && discount.savedPercent > 0 && (
                                        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                      Save {discount.savedPercent}%
                    </span>
                                    )}
                                </div>

                                {discount.isActive && discount.daysRemaining !== null && (
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                                        <Clock className="w-4 h-4" />
                                        {discount.daysRemaining > 0
                                            ? `Offer ends in ${discount.daysRemaining} day${discount.daysRemaining === 1 ? '' : 's'}`
                                            : 'Offer ends today'}
                                    </div>
                                )}
                            </div>

                            {/* Meta */}
                            <div className="mb-6 pb-6 border-b border-border space-y-2 text-sm">
                                {/*{product.code && (*/}
                                {/*    <p className="text-muted-foreground">*/}
                                {/*        <span className="font-semibold text-foreground">Code:</span> {product.code}*/}
                                {/*    </p>*/}
                                {/*)}*/}
                                {/*{product.barcode && (*/}
                                {/*    <p className="text-muted-foreground">*/}
                                {/*        <span className="font-semibold text-foreground">Barcode:</span> {product.barcode}*/}
                                {/*    </p>*/}
                                {/*)}*/}
                                {product.unit && (
                                    <p className="text-muted-foreground">
                                        <span className="font-semibold text-foreground">Unit:</span> {product.unit}
                                    </p>
                                )}
                                {(product.warrenty || product.guarantee) && (
                                    <p className="flex items-center gap-1.5 text-muted-foreground">
                                        <ShieldCheck className="w-4 h-4" />
                                        {product.warrenty ? `Warranty: ${product.warrenty}` : `Guarantee: ${product.guarantee}`}
                                    </p>
                                )}
                            </div>

                            {/* Quantity */}
                            <div className="mb-6 flex items-center gap-4">
                                <span className="text-sm font-medium">Quantity:</span>
                                <div className="flex items-center border border-border rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-4 py-2 hover:bg-muted transition-colors"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-16 text-center border-l border-r border-border"
                                    />
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="px-4 py-2 hover:bg-muted transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleAddToCart}
                                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                                        addedToCart ? 'bg-green-600 text-white' : 'bg-primary text-white hover:bg-primary/90'
                                    }`}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium">
                                        <Heart className="w-5 h-5" />
                                        Wishlist
                                    </button>
                                    <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium">
                                        <Share2 className="w-5 h-5" />
                                        Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {/* Description */}
                    {product.description && (
                        <div className="mb-6 pb-6 border-b border-border bg-white p-5">
                            <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                            <div
                                className="prose prose-sm max-w-none text-muted-foreground"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </div>
                    )}
                    {/* Related Products */}
                    {product.relatedProducts.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-foreground">You May Also Like</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {product.relatedProducts.map((rel) => (
                                    <Link
                                        key={rel.id}
                                        href={`/product/${rel.slug}`}
                                        className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <p className="font-medium text-foreground line-clamp-2">{rel.name}</p>
                                        <p className="text-primary font-bold mt-2">৳{rel.sale_price.toLocaleString()}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}
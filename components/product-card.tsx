"use client";

import { useCart } from "@/lib/cart-context";
import { ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  image: string;
  badge?: string;
  rating: number;
  reviews: number;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  originalPrice,
  image,
  badge,
  rating,
  reviews,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  // Only treat this as "discounted" if the original price is actually higher.
  // Avoids showing a redundant strikethrough price / 0% badge on regular items.
  const hasDiscount = originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      addItem({
        id,
        name,
        price,
        quantity: 1,
        image,
        stock: 100,
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link href={`/product/${slug}`}>
      <div className="group bg-white rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300">
        {/* Image Container */}
        <div className="relative h-64 bg-muted overflow-hidden">
          {/* Badge */}
          {(badge || hasDiscount) && (
            <div className="absolute top-3 left-3 z-10 flex gap-2">
              {badge && (
                <span className="inline-block px-2.5 py-1 bg-primary text-black text-xs font-bold rounded-md">
                  {badge}
                </span>
              )}
              {hasDiscount && (
                <span className="inline-block px-2.5 py-1 bg-green-500 text-black text-xs font-bold rounded-md">
                  Save {discountPercent}%
                </span>
              )}
            </div>
          )}

          {/* Image */}
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        {/* Content */}
        <div className="p-4 h-[164px] flex flex-col justify-end">
          {/* Product Name */}
          <p className="text-sm text-black line-clamp-2  transition-colors">
            {name}
          </p>

          {/* Rating */}
          {reviews > 0 && (
            <div className="flex items-center gap-1.5 my-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(rating)
                        ? "fill-primary text-primary"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-black">({reviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg text-black font-bold ">
              ৳{price.toLocaleString()}
            </span>

            {hasDiscount && (
              <span className="text-xs text-black line-through">
                ৳{originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 bg-[#013E77] border-primary text-primary rounded-lg  hover:text-white disabled:opacity-50 transition-all duration-200 font-semibold text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAdding ? "Adding..." : "Add To Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}

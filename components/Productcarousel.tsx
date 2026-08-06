"use client";

import { useCart } from "@/lib/cart-context";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Flame,
  Heart,
  ShoppingCart,
  Star,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ---- Types ----
// NOTE: field names below are my best-guess shape for a product-list
// endpoint. Adjust to match your actual API response if different.
interface Product {
  id: number;
  name: string;
  slug: string;
  brand?: string;
  image: string;
  price: number;
  original_price?: number;
  discount_percent?: number;
  rating?: number;
  rating_count?: number;
  stock_status?: "in_stock" | "limited" | "out_of_stock";
  badge?: { type: "hot_offer" | "friday_deal" | string; label: string } | null;
  emi_available?: boolean;
  cod_available?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

function buildImageUrl(path?: string) {
  if (!path) return "";
  if (!IMAGE_BASE_URL) return path;
  const base = IMAGE_BASE_URL.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${base}/${cleanPath}`;
}

function formatBDT(n?: number) {
  if (n == null) return "";
  return `৳ ${n.toLocaleString("en-BD")}`;
}

interface ProductCarouselProps {
  categorySlug: string;
  title: string;
}

export function ProductCarousel({ categorySlug, title }: ProductCarouselProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollPct, setScrollPct] = useState({ width: 100, left: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!API_BASE_URL) {
      setError("API base URL is not configured");
      setIsLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/products?category=${categorySlug}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          setError("Unexpected API response shape");
        }
      })
      .catch((err) => {
        console.error("[ProductCarousel] Failed to fetch products:", err);
        setError("Unable to load products right now.");
      })
      .finally(() => setIsLoading(false));
  }, [categorySlug]);

  function updateScrollBar() {
    const el = scrollRef.current;
    if (!el) return;
    const widthPct = Math.min(100, (el.clientWidth / el.scrollWidth) * 100);
    const maxScroll = el.scrollWidth - el.clientWidth;
    const leftPct =
      maxScroll > 0 ? (el.scrollLeft / maxScroll) * (100 - widthPct) : 0;
    setScrollPct({ width: widthPct, left: leftPct });
  }

  useEffect(() => {
    updateScrollBar();
  }, [products]);

  function scrollByCard(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 16 : 280;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section className="max-w-7xl bg-white mx-auto px-4 md:px-6 py-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-5">
        {title}
      </h2>

      <div className="relative">
        {/* Prev arrow */}
        <button
          onClick={() => scrollByCard("left")}
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white shadow-md items-center justify-center hover:bg-gray-50"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Cards */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-none w-[220px] sm:w-[260px] h-[420px] bg-muted rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-muted-foreground py-10">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">
            No products found
          </p>
        ) : (
          <div
            ref={scrollRef}
            onScroll={updateScrollBar}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {products.map((p) => {
              const isLimited = p.stock_status === "limited";
              const isOutOfStock = p.stock_status === "out_of_stock";

              return (
                <div
                  key={p.id}
                  data-card
                  className="relative flex-none w-[220px] sm:w-[260px] snap-start bg-white rounded-xl border border-border p-4 flex flex-col"
                >
                  {p.badge && (
                    <span
                      className="absolute top-3 left-3 z-10 w-14 h-14 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold text-white text-center leading-tight px-1"
                      style={{
                        background:
                          p.badge.type === "friday_deal"
                            ? "linear-gradient(160deg,#E11D6E,#C2185B)"
                            : "linear-gradient(160deg,#F97316,#EF4444)",
                      }}
                    >
                      {p.badge.type === "hot_offer" && (
                        <Flame className="w-4 h-4 mb-0.5" />
                      )}
                      {p.badge.label}
                    </span>
                  )}

                  <button
                    className="absolute top-3 right-3 z-10 text-pink-600 hover:scale-110 transition-transform"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="w-5 h-5" />
                  </button>

                  <div className="relative h-44 sm:h-52 mb-3 mt-2">
                    {p.image && (
                      <Image
                        src={buildImageUrl(p.image)}
                        alt={p.name}
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    )}
                  </div>

                  {p.brand && (
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                      {p.brand}
                    </p>
                  )}
                  <h3 className="text-sm font-semibold text-foreground leading-snug mb-1 line-clamp-2">
                    {p.name}
                  </h3>

                  {isLimited && (
                    <p className="text-xs font-medium text-red-600 mb-1">
                      Limited Stock!
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span
                      className="font-bold text-lg"
                      style={{ color: "#C81E3A" }}
                    >
                      {formatBDT(p.price)}
                    </span>
                    {!!p.discount_percent && (
                      <span
                        className="text-white text-[11px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "#C81E3A" }}
                      >
                        -{p.discount_percent}%
                      </span>
                    )}
                  </div>
                  {p.original_price && (
                    <span className="text-xs text-muted-foreground line-through mb-2 block">
                      {formatBDT(p.original_price)}
                    </span>
                  )}

                  {p.rating != null && (
                    <div className="flex items-center gap-1 mb-3 text-sm text-foreground">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>
                        {p.rating.toFixed(1)}/5{" "}
                        {p.rating_count ? `(${p.rating_count})` : ""}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {p.emi_available && (
                      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        <CreditCard className="w-3.5 h-3.5" /> EMI
                      </span>
                    )}
                    {p.cod_available && (
                      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        <Wallet className="w-3.5 h-3.5" /> COD
                      </span>
                    )}
                  </div>

                  <div className="mt-auto">
                    {isLimited || isOutOfStock ? (
                      <Link
                        href={`/product/${p.slug}`}
                        className="flex items-center justify-center gap-2 w-full border-2 rounded-full py-2.5 text-sm font-semibold transition-colors hover:bg-teal-50"
                        style={{ borderColor: "#0C6B58", color: "#0C6B58" }}
                      >
                        <FileText className="w-4 h-4" /> See Details
                      </Link>
                    ) : (
                      <button
                        onClick={() => addToCart?.(p)}
                        className="flex items-center justify-center gap-2 w-full text-white rounded-full py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ backgroundColor: "#0C6B58" }}
                      >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Next arrow */}
        <button
          onClick={() => scrollByCard("right")}
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white shadow-md items-center justify-center hover:bg-gray-50"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Scroll progress bar */}
      {!isLoading && products.length > 0 && (
        <div className="mt-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-400 rounded-full transition-all"
            style={{
              width: `${scrollPct.width}%`,
              marginLeft: `${scrollPct.left}%`,
            }}
          />
        </div>
      )}
    </section>
  );
}

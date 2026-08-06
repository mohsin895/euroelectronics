"use client";

import { FloatingCart } from "@/components/floating-cart";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Brand {
  id: number;
  name: string;
  slug: string;
  image: string;
  status: string;
  // Optional — add these on the backend brand payload to power the
  // history section below. Falls back gracefully if not present yet.
  banner?: string;
  description?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

function buildImageUrl(path: string) {
  if (!IMAGE_BASE_URL) return path;
  const base = IMAGE_BASE_URL.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${base}/${cleanPath}`;
}

const FALLBACK_DESCRIPTION =
  "Full brand history is coming soon. In the meantime, browse the products we currently carry from this brand.";

// ---- Framer Motion variants ----
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const fadeSide = (fromRight: boolean) => ({
  hidden: { opacity: 0, x: fromRight ? 40 : -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
});

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_BASE_URL) {
      setError("API base URL is not configured");
      setIsLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/brands`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setBrands(data.data.filter((b: Brand) => b.status === "Active"));
        } else {
          setError("Unexpected API response shape");
        }
      })
      .catch((err) => {
        console.error("[BrandsPage] Failed to fetch brands:", err);
        setError("Unable to load brands right now.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero banner */}
        <div className="relative w-full h-[240px] sm:h-[300px] md:h-[380px] lg:h-[420px] overflow-hidden">
          <Image
            src="/brand.png"
            alt="Our brands"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/10" />

          {/* Overlay panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-x-0 bottom-0 md:left-[40%] bg-background/90 backdrop-blur-sm px-5 sm:px-8 md:px-10 py-5 sm:py-6 flex items-center justify-between gap-3"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Brand History
            </h1>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                href="/contact"
                className="hidden sm:inline-block bg-background border border-border rounded-md px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Contact us
              </Link>
              <button
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 bg-primary hover:opacity-90 transition-opacity"
                aria-label="Chat with us"
              >
                <MessageCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-primary-foreground" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Brand history sections */}
        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 space-y-14">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="grid md:grid-cols-2 gap-8 md:gap-14 items-center"
              >
                <div className="h-56 sm:h-72 md:h-[380px] bg-muted rounded-lg animate-pulse" />
                <div className="space-y-3">
                  <div className="h-6 w-2/3 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-muted-foreground py-16">{error}</p>
        ) : brands.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            No brands found
          </p>
        ) : (
          brands.map((brand, index) => {
            const reverse = index % 2 === 1;
            const bannerSrc = brand.banner
              ? buildImageUrl(brand.banner)
              : brand.image
                ? buildImageUrl(brand.image)
                : null;

            return (
              <section
                key={brand.id}
                className={reverse ? "bg-muted/40" : "bg-background"}
              >
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
                  <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
                    <motion.div
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, amount: 0.3 }}
                      variants={fadeSide(!reverse)}
                      className={`relative w-full h-56 sm:h-72 md:h-[380px] rounded-lg overflow-hidden bg-white ${
                        reverse ? "md:order-1" : "md:order-2"
                      }`}
                    >
                      {bannerSrc ? (
                        <Image
                          src={bannerSrc}
                          alt={`${brand.name} home appliances`}
                          fill
                          unoptimized
                          className="object-contain md:object-cover p-6 md:p-0"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                          No image available
                        </div>
                      )}
                    </motion.div>

                    <motion.div
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, amount: 0.3 }}
                      variants={fadeSide(reverse)}
                      className={reverse ? "md:order-2" : "md:order-1"}
                    >
                      <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-foreground mb-4">
                        History of{" "}
                        <Link
                          href={`/brand/${brand.slug}`}
                          className="text-primary hover:underline"
                        >
                          {brand.name}
                        </Link>{" "}
                        Home Appliance
                      </h2>
                      <p className="text-muted-foreground leading-relaxed text-sm sm:text-[15px]">
                        {brand.description || FALLBACK_DESCRIPTION}
                      </p>
                      <Link
                        href={`/brand/${brand.slug}`}
                        className="inline-block mt-5 text-sm font-semibold text-primary hover:underline"
                      >
                        View {brand.name} products →
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </section>
            );
          })
        )}
      </main>
      <Footer />
      <FloatingCart />
    </>
  );
}

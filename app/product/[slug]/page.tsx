import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FeaturesBar } from "@/components/features-bar";
import { FloatingButtons } from "@/components/floating-buttons";
import { ProductDetails } from "@/components/product-details";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import type { ApiCategory } from "@/app/page";
import siteData from "@/data/site.json";
import type { ProductDetail, RelatedProduct } from "@/lib/product.types";
import type { SiteData } from "@/lib/types";

const data = siteData as SiteData;

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? "";
const PATH = process.env.NEXT_PUBLIC_PATH ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_DOMAIN ?? "";

// ===================== Fetch Product =====================
async function getProduct(slug: string): Promise<{
  product: ProductDetail;
  related_products: RelatedProduct[];
} | null> {
  try {
    const res = await fetch(`${DOMAIN}/products/details/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const json = await res.json();

    return json.success
      ? {
          product: json.product,
          related_products: json.related_products ?? [],
        }
      : null;
  } catch {
    return null;
  }
}

// ===================== Fetch Categories =====================
async function getCategories(): Promise<ApiCategory[]> {
  try {
    const res = await fetch(`${DOMAIN}/categories`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const json = await res.json();

    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

// ===================== SEO Metadata =====================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const result = await getProduct(slug);

  if (!result) {
    return {
      title: "Product Not Found",
      description: "Requested product was not found.",
    };
  }

  const { product } = result;

  const title =
    (product as any).meta_title || `${product.name} | ${data.brand.name}`;

  const description =
    (product as any).meta_description ||
    product.description?.replace(/<[^>]*>/g, "").substring(0, 160) ||
    product.name;

  const keywords = (product as any).meta_keywords
    ? (product as any).meta_keywords.split(",")
    : [product.name];

  const image = product.thumbnail?.file_name
    ? `${PATH}/${product.thumbnail.file_name}`
    : `${SITE_URL}/placeholder.png`;

  const url = `${SITE_URL}/products/${slug}`;

  return {
    title,
    description,
    keywords,

    robots: {
      index: true,
      follow: true,
    },

    alternates: {
      canonical: url,
    },

    openGraph: {
      title,
      description,
      url,
      siteName: data.brand.name,
      type: "website",

      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// ===================== Page =====================
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [result, categories] = await Promise.all([
    getProduct(slug),
    getCategories(),
  ]);

  if (!result) {
    notFound();
  }

  const { product, related_products } = result;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",

    name: product.name,

    image: product.thumbnail?.file_name
      ? [`${PATH}/${product.thumbnail.file_name}`]
      : [],

    description: product.description?.replace(/<[^>]*>/g, "") ?? "",

    sku: String(product.id),

    brand: {
      "@type": "Brand",
      name: data.brand.name,
    },

    offers: {
      "@type": "Offer",

      priceCurrency: "BDT",

      price: product.unit_price,

      availability:
        product.current_stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

      url: `${SITE_URL}/products/${slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />

      <SiteHeader brand={data.brand} categories={categories} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <ProductDetails
          product={product}
          relatedProducts={related_products}
          path={PATH}
        />
      </main>

      <FeaturesBar features={data.features} />

      <SiteFooter brand={data.brand} footer={data.footer} />

      <FloatingButtons />
    </div>
  );
}

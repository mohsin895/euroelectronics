import type { Metadata } from "next";

import { CustomerSupport } from "@/components/customer-support";
import { FloatingButtons } from "@/components/floating-buttons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import siteData from "@/data/site.json";
import { getSocialLinks } from "@/lib/getSocials";
import type { Footer, SiteData } from "@/lib/types";

const data = siteData as SiteData;

export const metadata: Metadata = {
  title: "Customer Support & Service | EuroHome Electronics",
  description:
    "Installation, warranty, and after-sales support for your EuroHome appliances — hotline, email, showroom address, service areas, and what to expect at every step.",
};

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? "";

const staticFooterData: Omit<Footer, "socials"> = {
  linksTitle: "প্রয়োজনীয় লিংক",

  links: [
    {
      label: "আমাদের সাথে যোগাযোগ করুন",
      url: "/page/contact",
    },
    {
      label: "Order Procedure",
      url: "/page/order-procedure",
    },
    {
      label: "Delivery Rules",
      url: "/page/delivery-rules",
    },
    {
      label: "Return Policy",
      url: "/page/return-policy",
    },
  ],

  infoTitle: "INFORMATION",

  info: [
    {
      label: "সব পণ্য",
      url: "/shop",
    },
    {
      label: "Delivery Rules",
      url: "/page/delivery-rules",
    },
    {
      label: "Warranty",
      url: "/page/warranty",
    },
    {
      label: "Terms & Conditions",
      url: "/page/terms-conditions",
    },
    {
      label: "Privacy Policy",
      url: "/page/privacy-policy",
    },
  ],

  newsletterTitle: "NEWSLETTER",

  newsletterText:
    "Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.",

  socialTitle: "FOLLOW US ON",

  supportLabel: "কাস্টমার সাপোর্ট",

  copyright: "Copyright © 2026 Moto Empire BD. All Rights Reserved.",

  developer: "Nelsistech",
};

async function getCategories() {
  try {
    const res = await fetch(`${DOMAIN}/categories`, {
      next: {
        revalidate: 60,
      },
    });

    if (!res.ok) {
      return [];
    }

    const json = await res.json();

    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Categories fetch error:", error);
    return [];
  }
}

export default async function SupportAndServicePage() {
  const [categories, socials] = await Promise.all([
    getCategories(),
    getSocialLinks(),
  ]);

  const footer: Footer = {
    ...staticFooterData,
    socials,
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader brand={data.brand} categories={categories} />

      <main>
        <CustomerSupport />
      </main>

      <SiteFooter brand={data.brand} footer={footer} />

      <FloatingButtons />
    </div>
  );
}

"use client";

import { motion, MotionConfig, type Variants } from "framer-motion";
import {
  CalendarX2,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType, CSSProperties, ReactNode } from "react";

// ─── Images ─────────────────────────────────────────────────────────────
// Free-to-use Unsplash photos (Unsplash License — free for commercial use,
// no attribution required). Swap for your own showroom / technician photos
// whenever you have them; just keep the same variable names.
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1754415163555-c583965c4fb2?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  afterSales:
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?fm=jpg&q=80&w=2000&auto=format&fit=crop",
} as const;

// ─── Brand tokens (scoped as CSS vars so Tailwind arbitrary values work) ──
const BRAND_STYLE = {
  ["--navy" as string]: "#013E77",
  ["--navy-deep" as string]: "#012A52",
  ["--oak" as string]: "#B7854F",
  ["--oak-deep" as string]: "#8F6538",
  ["--paper" as string]: "#F7F5F1",
  ["--panel" as string]: "#F0ECE3",
  ["--line" as string]: "#E7E1D6",
  ["--ink" as string]: "#1F2937",
  ["--steel" as string]: "#5B6472",
};

// ─── Motion variants ──────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const fadeItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Small building blocks ────────────────────────────────────────────
function Eyebrow({ children }: { children: string }) {
  return (
    <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.28em] text-[--oak-deep]">
      {children}
    </span>
  );
}

function Block({
  heading,
  icon: Icon,
  children,
}: {
  heading?: string;
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <motion.div variants={fadeItem} className="mb-7">
      {heading && (
        <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-[--ink] sm:text-[17px]">
          {Icon && (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[--navy]/10 text-[--navy]">
              <Icon className="h-3.5 w-3.5" />
            </span>
          )}
          {heading}
        </h3>
      )}
      <div className="space-y-3 text-[15px] leading-relaxed text-[--steel]">
        {children}
      </div>
    </motion.div>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-3 space-y-2.5">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-2.5 text-[15px] leading-relaxed text-[--steel]"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[--oak]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[--navy]/10 text-[--navy]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="text-[15px] leading-relaxed text-[--steel]">
        <span className="font-semibold text-[--ink]">{label}: </span>
        {children}
      </div>
    </div>
  );
}

function Column({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={stagger}
    >
      {children}
    </motion.div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────
export function CustomerSupport() {
  return (
    <MotionConfig reducedMotion="user">
      <main style={BRAND_STYLE as CSSProperties} className="bg-[--paper]">
        {/* ── Hero ── */}
        <section className="relative">
          <div className="relative h-[280px] w-full sm:h-[420px]">
            <Image
              src={IMAGES.hero}
              alt="EuroHome showroom with built-in kitchen appliances"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[--navy-deep]/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-[--navy-deep]/70 sm:via-transparent sm:to-transparent" />
          </div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="relative z-10 mx-4 -mt-14 max-w-lg rounded-2xl bg-white/95 p-6 shadow-2xl backdrop-blur sm:absolute sm:bottom-8 sm:right-8 sm:mx-0 sm:mt-0 sm:bg-white/90 sm:p-8"
          >
            <Eyebrow>Support</Eyebrow>
            <h1 className="mb-4 text-2xl font-bold leading-tight text-[--ink] sm:text-3xl">
              Customer Support &amp; Service
            </h1>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-full bg-[--navy] px-5 py-2.5 text-sm font-semibold text-black transition-transform duration-200 hover:-translate-y-0.5"
            >
              <MessageSquare className="h-4 w-4" />
              Contact Us
            </Link>
          </motion.div>
        </section>

        {/* ── Customer Support ── */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-16">
            {/* Left column */}
            <Column>
              <motion.div variants={fadeItem}>
                <Eyebrow>Customer Support</Eyebrow>
                <h2 className="mb-5 text-3xl font-bold leading-tight text-[--ink] sm:text-4xl">
                  Here to help, before and after you buy.
                </h2>
              </motion.div>

              <Block>
                <p>
                  We assist our customers in making correct use of a product —
                  planning, installation, troubleshooting, and maintenance.
                  We&apos;re also committed to delivering goods within mutually
                  agreed-upon times.
                </p>
              </Block>

              <Block heading="Our Commitment">
                <p>
                  We&apos;re committed to exceptional customer service that
                  ensures your complete satisfaction. Our support team is always
                  ready to help with product information, installation guidance,
                  warranty claims, maintenance tips, or any concern you may
                  have.
                </p>
              </Block>

              <Block heading="Support Hours">
                <div className="space-y-2.5 pt-1">
                  <InfoRow icon={Clock} label="Sunday to Thursday">
                    10:00 AM – 7:00 PM
                  </InfoRow>
                  <InfoRow icon={CalendarX2} label="Friday & Public Holidays">
                    Closed
                  </InfoRow>
                </div>
              </Block>
            </Column>

            {/* Right column */}
            <Column>
              <Block heading="Product Installation & Demonstration">
                <p>
                  Upon request, professional installation and product
                  demonstration services are available for select home
                  appliances. Service charges may apply outside Dhaka or for
                  specialised items.
                </p>
              </Block>

              <Block heading="Feedback & Continuous Improvement">
                <p>
                  We value your feedback — it helps us improve our products and
                  service quality. Please share your experience or suggestions
                  through our official channels.
                </p>
                <p>
                  For urgent matters, reach us through our hotline or email and
                  we&apos;ll respond as soon as possible.
                </p>
              </Block>

              <motion.div
                variants={fadeItem}
                className="rounded-2xl border border-[--line] bg-white p-6 sm:p-7"
              >
                <h3 className="mb-5 text-lg font-bold text-[--ink]">
                  How to Reach Us
                </h3>
                <div className="space-y-4">
                  <InfoRow icon={Phone} label="Hotline">
                    <a
                      href="tel:+8801755573657"
                      className="hover:text-[--navy]"
                    >
                      01755-573657
                    </a>
                  </InfoRow>
                  <InfoRow icon={Mail} label="Email">
                    <a
                      href="mailto:info@eurohomebd.com"
                      className="hover:text-[--navy]"
                    >
                      info@eurohomebd.com
                    </a>
                  </InfoRow>
                  <InfoRow icon={MapPin} label="Showroom / Service Center">
                    EuroHome Electronics &amp; Kitchenware, Shop # 33, Level -2,
                    SKS Tower, 7 VIP Road, Mohakhali, Dhaka-1206
                  </InfoRow>
                </div>
              </motion.div>
            </Column>
          </div>
        </section>

        {/* ── After Sales Service ── */}
        <section className="bg-[--panel] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-16">
              {/* Left column */}
              <Column>
                <motion.div variants={fadeItem}>
                  <Eyebrow>After Sales Service</Eyebrow>
                  <h2 className="mb-5 text-3xl font-bold leading-tight text-[--ink] sm:text-4xl">
                    Our responsibility doesn&apos;t end at checkout.
                  </h2>
                </motion.div>

                <Block>
                  <p>
                    It&apos;s not enough to say &ldquo;thanks&rdquo; or
                    &ldquo;let&apos;s keep in touch&rdquo; after a sale is
                    complete. We believe long-term success is built on real,
                    lasting customer relationships. We provide warranty as per
                    the written terms in your warranty card — usually from ready
                    stock, and within 60 working days when a part needs to be
                    arranged.
                  </p>
                </Block>

                <Block heading="Our Promise">
                  <p>
                    Our responsibility doesn&apos;t end with the sale. Our
                    After-Sales Service team makes sure every customer keeps
                    enjoying a smooth, satisfactory experience with our products
                    long after purchase.
                  </p>
                  <p>
                    We aim to deliver professional, timely, and reliable support
                    for all your home appliances.
                  </p>
                </Block>

                <Block heading="Service Coverage">
                  <p>Our After-Sales Services include:</p>
                  <Bullets
                    items={[
                      "Product installation and user guidance",
                      "Warranty claim handling",
                      "Product inspection, maintenance, and repairs",
                      "Genuine spare parts replacement",
                      "Technical consultation and troubleshooting support",
                    ]}
                  />
                  <p className="pt-1 text-sm text-[--steel]/80">
                    Service availability may vary by product type and location.
                  </p>
                </Block>

                <Block heading="Site Visit Facility">
                  <p>
                    Site visits are available on request and are chargeable
                    based on location and service type.
                  </p>
                  <Bullets
                    items={[
                      "Visits include inspection, technical assessment, or installation preparation.",
                      "Inside Dhaka: standard site visit charge applies.",
                      "Outside Dhaka: additional travel or service charges may apply.",
                      "Site visits are scheduled only after payment confirmation.",
                    ]}
                  />
                </Block>
              </Column>

              {/* Right column */}
              <Column>
                <motion.div
                  variants={fadeItem}
                  className="relative mb-8 h-[260px] overflow-hidden rounded-2xl sm:h-[320px]"
                >
                  <Image
                    src={IMAGES.afterSales}
                    alt="Built-in refrigerator serviced in a modern kitchen"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </motion.div>

                <Block heading="Out-of-Warranty Service" icon={Wrench}>
                  <p>
                    After the warranty period expires, customers may still
                    receive service under our paid maintenance program.
                  </p>
                  <Bullets
                    items={[
                      "Charges depend on the type of repair or replacement needed.",
                      "Only genuine parts approved by the manufacturer are used.",
                      "Cost estimates are provided before service work begins.",
                    ]}
                  />
                </Block>

                <Block heading="Service Areas" icon={Truck}>
                  <Bullets
                    items={[
                      <span key="inside">
                        <span className="font-semibold text-[--ink]">
                          Inside Dhaka:
                        </span>{" "}
                        home service and installation within 1–3 working days.
                      </span>,
                      <span key="outside">
                        <span className="font-semibold text-[--ink]">
                          Outside Dhaka:
                        </span>{" "}
                        courier or authorized service partner support (charges
                        may apply).
                      </span>,
                      "For courier deliveries, any transit damage risk remains with the purchaser unless otherwise agreed.",
                    ]}
                  />
                </Block>

                <Block heading="Customer Responsibilities">
                  <p>To ensure smooth service, customers are requested to:</p>
                  <Bullets
                    items={[
                      "Retain purchase documents and warranty cards.",
                      "Provide accurate information about the issue.",
                      "Allow safe and timely access for service personnel.",
                      "Avoid unauthorized repairs during the warranty period.",
                    ]}
                  />
                </Block>

                <Block heading="Continuous Care">
                  <p>
                    We value long-term relationships with our customers. Our
                    team periodically shares maintenance tips and product care
                    advice to help you extend the life and performance of your
                    appliances.
                  </p>
                </Block>
              </Column>
            </div>
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"
        >
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-[--navy] p-8 sm:flex-row sm:items-center sm:p-10">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-black">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="mb-1 text-xl font-bold text-black sm:text-2xl">
                  Need a hand with an appliance?
                </h3>
                <p className="text-sm text-black/75 sm:text-[15px]">
                  Installation, warranty claims, or a repair estimate — our team
                  responds fast on the hotline or by email.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <a
                href="tel:+8801755573657"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[--navy] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Phone className="h-4 w-4" />
                Call Hotline
              </a>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-black transition-colors duration-200 hover:bg-white/10"
              >
                <MessageSquare className="h-4 w-4" />
                Chat With Us
              </Link>
            </div>
          </div>
        </motion.section>
      </main>
    </MotionConfig>
  );
}

"use client";

import {
  motion,
  MotionConfig,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  CookingPot,
  MessageSquare,
  Pause,
  Play,
  Quote,
  Refrigerator,
  TrendingUp,
  Truck,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";

// ─── Assets ─────────────────────────────────────────────────────────────
// Free-to-use stock media (Unsplash License / Pexels License — both free
// for commercial use, no attribution required). Swap for your own showroom
// photos and intro video whenever you have them; just keep these keys.
const IMAGES = {
  heroLeft:
    "https://images.unsplash.com/photo-1757711990497-4bd910fbe3cb?fm=jpg&q=80&w=2000&auto=format&fit=crop",
  heroCenter:
    "https://images.unsplash.com/photo-1632923565835-6582b54f2105?fm=jpg&q=80&w=2000&auto=format&fit=crop",
  heroRight:
    "https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?fm=jpg&q=80&w=2000&auto=format&fit=crop",
  video:
    "https://videos.pexels.com/video-files/15887298/15887298-uhd_2560_1440_30fps.mp4",
  videoPoster:
    "https://images.pexels.com/videos/15887298/pexels-photo-15887298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  mission:
    "https://images.unsplash.com/photo-1560562125-ab512e4d9d29?fm=jpg&q=80&w=2000&auto=format&fit=crop",
  vision:
    "https://images.unsplash.com/photo-1594297270189-4056091ab583?fm=jpg&q=80&w=2000&auto=format&fit=crop",
} as const;

// ─── Copy ───────────────────────────────────────────────────────────────
const WHY_US = [
  {
    icon: Refrigerator,
    text: "Authentic, world-class European products from leading brands — Siemens, Bosch, Electrolux, and more.",
  },
  {
    icon: Truck,
    text: "On-time delivery, expert installation support, and the best market-competitive pricing, every time.",
  },
  {
    icon: CookingPot,
    text: "An exclusive, prestigious range of European appliances tailored to niche market demands.",
  },
  {
    icon: TrendingUp,
    text: "Growing steadily through Direct Sales, Retail, B2B, and Distribution channels across Bangladesh.",
  },
  {
    icon: Wrench,
    text: "Free delivery and professional installation on every order — no exceptions.",
  },
] as const;

// ─── Motion variants ──────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const fadeItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Brand tokens (scoped as CSS vars so Tailwind arbitrary values work) ──
const BRAND_STYLE = {
  ["--navy" as string]: "#013E77",
  ["--navy-deep" as string]: "#012A52",
  ["--oak" as string]: "#B7854F",
  ["--oak-deep" as string]: "#8F6538",
  ["--paper" as string]: "#F7F5F1",
  ["--line" as string]: "#E7E1D6",
  ["--ink" as string]: "#1F2937",
  ["--steel" as string]: "#5B6472",
};

// ─── Small building blocks ────────────────────────────────────────────
function Eyebrow({ children }: { children: string }) {
  return (
    <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.28em] text-[--oak-deep]">
      {children}
    </span>
  );
}

function IntroVideo() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[--line] bg-white shadow-[0_24px_60px_-24px_rgba(1,62,119,0.35)]">
      <div className="relative aspect-video w-full overflow-hidden bg-[--navy-deep]">
        <video
          ref={videoRef}
          src={IMAGES.video}
          poster={IMAGES.videoPoster}
          controls={playing}
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="h-full w-full object-cover"
        />

        {!playing && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Play the EuroHome intro video"
            className="absolute inset-0 flex items-center justify-center bg-[--navy-deep]/30 transition-colors duration-300 group-hover:bg-[--navy-deep]/40"
          >
            <motion.span
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[--navy] shadow-lg sm:h-20 sm:w-20"
            >
              <Play className="ml-1 h-6 w-6 fill-current sm:h-7 sm:w-7" />
            </motion.span>
          </button>
        )}

        {playing && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Pause the EuroHome intro video"
            className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-black opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            <Pause className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="bg-[--oak] px-5 py-3 text-center text-sm font-semibold tracking-wide text-black sm:text-base">
        Intro Video of EuroHome Electronics
      </div>
    </div>
  );
}

function CounterRail({
  targetRef,
}: {
  targetRef: RefObject<HTMLDivElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 0.2", "end 0.75"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-px lg:block">
      <div className="absolute inset-y-0 left-0 w-px bg-[--line]" />
      <motion.div
        style={{ scaleY }}
        className="absolute left-0 top-0 h-full w-px origin-top bg-[--oak]"
      />
      <span className="absolute -left-[5px] top-0 h-[11px] w-[11px] rounded-full border-2 border-[--oak] bg-[--paper]" />
      <span className="absolute -left-[5px] bottom-0 h-[11px] w-[11px] rounded-full border-2 border-[--oak] bg-[--paper]" />
    </div>
  );
}

function SplitSection({
  eyebrow,
  heading,
  image,
  imageAlt,
  reverse = false,
  children,
}: {
  eyebrow: string;
  heading: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        variants={fadeUp}
        className="relative h-[280px] overflow-hidden rounded-2xl sm:h-[360px] lg:h-[420px]"
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={stagger}
      >
        <motion.div variants={fadeItem}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </motion.div>
        <motion.h2
          variants={fadeItem}
          className="mb-5 text-3xl font-bold leading-tight text-[--ink] sm:text-4xl"
        >
          {heading}
        </motion.h2>
        <motion.div
          variants={fadeItem}
          className="space-y-4 text-[15px] leading-relaxed text-[--steel]"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────
export function AboutUs() {
  const railTargetRef = useRef<HTMLDivElement>(null);

  return (
    <MotionConfig reducedMotion="user">
      <main style={BRAND_STYLE as CSSProperties} className="bg-[--paper]">
        {/* ── Hero ── */}
        <section className="relative">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
            <div className="relative h-[220px] sm:h-[380px]">
              <Image
                src={IMAGES.heroLeft}
                alt="EuroHome showroom kitchen with built-in appliances"
                fill
                priority
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative hidden h-[380px] sm:block">
              <Image
                src={IMAGES.heroCenter}
                alt="EuroHome washing machine and dryer set"
                fill
                sizes="33vw"
                className="object-cover"
              />
            </div>
            <div className="relative hidden h-[380px] sm:block">
              <Image
                src={IMAGES.heroRight}
                alt="EuroHome built-in refrigerator and ovens"
                fill
                sizes="33vw"
                className="object-cover"
              />
            </div>
          </div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="relative z-10 mx-4 -mt-16 max-w-md rounded-2xl bg-[--navy]/95 p-6 text-black shadow-2xl backdrop-blur sm:absolute sm:bottom-8 sm:right-8 sm:mx-0 sm:mt-0 sm:p-8"
          >
            <Eyebrow>About EuroHome</Eyebrow>
            <h1 className="mb-3 text-2xl font-bold leading-tight sm:text-3xl">
              Bringing Europe&apos;s finest kitchens home.
            </h1>
            <p className="text-sm leading-relaxed text-black/85 sm:text-[15px]">
              Since 2019, EuroHome Electronics has been Bangladesh&apos;s
              trusted seller of authentic Siemens, Bosch, and Electrolux
              appliances — delivered, installed, and supported end to end.
            </p>
          </motion.div>
        </section>

        {/* ── Who We Are ── */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
            >
              <IntroVideo />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={stagger}
            >
              <motion.div variants={fadeItem}>
                <Eyebrow>Who We Are?</Eyebrow>
              </motion.div>
              <motion.h2
                variants={fadeItem}
                className="mb-5 text-3xl font-bold leading-tight text-[--ink] sm:text-4xl"
              >
                A seller you can trust, for appliances built to last.
              </motion.h2>

              <motion.div
                variants={fadeItem}
                className="mb-8 space-y-4 text-[15px] leading-relaxed text-[--steel]"
              >
                <p>
                  Founded in 2019, EuroHome Electronics Limited serves
                  Bangladeshi households with world-class European home
                  appliance brands — including Siemens (Germany), Bosch
                  (Germany), and Electrolux (Sweden). We are the authorized
                  seller of renowned multi-brand electronics and home
                  appliances.
                </p>
                <p>
                  We specialize in premium built-in kitchen and home appliances:
                  gas cookers, hobs, hoods, microwave and electric ovens,
                  dishwashers, washing machines, built-in fridges, and upright
                  fridge-freezers.
                </p>
                <p>
                  Backed by an experienced Sales, Marketing, After-Sales, and
                  Supply Chain team, every customer gets the best price, the
                  fastest delivery, professional installation, and complete
                  satisfaction.
                </p>
              </motion.div>

              <motion.div
                variants={fadeItem}
                className="rounded-2xl border border-[--line] bg-white p-6 sm:p-7"
              >
                <h3 className="mb-5 text-lg font-bold text-[--ink]">Why we?</h3>
                <motion.ul
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.5 }}
                  variants={stagger}
                  className="space-y-4"
                >
                  {WHY_US.map(({ icon: Icon, text }) => (
                    <motion.li
                      key={text}
                      variants={fadeItem}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[--navy]/10 text-[--navy]">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm leading-relaxed text-[--steel]">
                        {text}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>

              <motion.div variants={fadeItem} className="mt-8">
                <Link
                  href="/categories"
                  className="group inline-flex items-center gap-2 rounded-full bg-[--navy] px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-[--navy]/20 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Explore Our Products
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Mission / Vision, tied together with a scroll rail ── */}
        <section
          ref={railTargetRef}
          className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6"
        >
          <CounterRail targetRef={railTargetRef} />

          <div className="space-y-20 py-12 lg:pl-14 lg:py-20">
            <SplitSection
              eyebrow="Our Mission"
              heading="Sales and service worth trusting."
              image={IMAGES.mission}
              imageAlt="EuroHome built-in gas hob on a kitchen island"
            >
              <p>
                Our mission is to deliver exceptional sales and service
                experiences for premium home appliances. We provide personalized
                solutions that complement each client&apos;s lifestyle, while
                building lasting relationships rooted in trust, excellence, and
                elegance.
              </p>
            </SplitSection>

            <SplitSection
              eyebrow="Our Vision"
              heading="Excellence, delivered to every kitchen."
              image={IMAGES.vision}
              imageAlt="EuroHome cooker hood in a modern kitchen"
              reverse
            >
              <p>
                Our vision is to achieve excellence through our philosophy of{" "}
                <span className="font-semibold text-[--ink]">
                  Success Through Customer Satisfaction
                </span>
                . We aspire to become the most trusted destination for
                fulfilling your aesthetic and functional needs with premium
                European home appliances that embody innovation, sophistication,
                and luxury.
              </p>
              <div className="flex gap-3 rounded-xl bg-[--navy]/5 p-4">
                <Quote className="h-5 w-5 shrink-0 text-[--oak-deep]" />
                <p className="text-sm italic text-[--steel]">
                  &ldquo;Success Through Customer Satisfaction&rdquo; guides
                  every delivery, installation, and follow-up call we make.
                </p>
              </div>
            </SplitSection>
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          className="mx-auto max-w-7xl px-4 pb-20 sm:px-6"
        >
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-[--navy] p-8 sm:flex-row sm:items-center sm:p-10">
            <div>
              <h3 className="mb-1 text-xl font-bold text-black sm:text-2xl">
                Ready to upgrade your kitchen?
              </h3>
              <p className="text-sm text-black/75 sm:text-[15px]">
                Browse authentic Siemens, Bosch, and Electrolux appliances —
                free delivery and professional installation included.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[--navy] transition-transform duration-200 hover:-translate-y-0.5"
              >
                Browse Appliances
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-black transition-colors duration-200 hover:bg-white/10"
              >
                <MessageSquare className="h-4 w-4" />
                Talk to Us
              </Link>
            </div>
          </div>
        </motion.section>
      </main>
    </MotionConfig>
  );
}

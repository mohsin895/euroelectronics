"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ApiCategory } from "@/app/page";
import { AuthNavButton } from "@/components/auth-nav-button";
import { CartButton } from "@/components/cart-button";
import { SearchBar } from "@/components/search-bar";
import type { Brand } from "@/lib/types";
import {
  AirVent,
  BatteryCharging,
  Cable,
  Camera,
  ChefHat,
  ChevronDown,
  Coffee,
  CookingPot,
  Droplet,
  Fan,
  Flame,
  Headphones,
  Laptop,
  MapPin,
  Menu,
  MessageSquare,
  Package,
  PackageSearch,
  Refrigerator,
  Scissors,
  Smartphone,
  Snowflake,
  Speaker,
  Tv,
  Usb,
  Watch,
  Wind,
  X,
  Zap,
} from "lucide-react";
import logo from "../public/logo.png";

// ─── Internal nav shape ────────────────────────────────────────────────────────
interface NavLeaf {
  label: string;
  href: string;
}
interface NavChild {
  label: string;
  href: string;
  children?: NavLeaf[];
}
interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  children?: NavChild[];
}

// ─── Map API → NavItem[] ───────────────────────────────────────────────────────
function mapCategories(data: ApiCategory[]): NavItem[] {
  return [...data]
    .sort((a, b) => a.order_level - b.order_level)
    .map((cat) => ({
      label: cat.name,
      href: `/category/${cat.slug}`,
      hasDropdown: cat.sub_categories.length > 0,
      children: cat.sub_categories.map((sub) => ({
        label: sub.name,
        href: `/subcategory/${sub.slug}`,
        children: sub.child_categories.map((child) => ({
          label: child.name,
          href: `/subcategory/${cat.slug}/${sub.slug}/${child.slug}`,
        })),
      })),
    }));
}

// ─── Icon lookup for category columns ──────────────────────────────────────────
// Categories come from the API as plain names, so we match on keywords to pick
// a representative icon. Falls back to a generic package icon when nothing matches.
const CATEGORY_ICON_RULES: [RegExp, typeof Package][] = [
  [/refrigerator|fridge/i, Refrigerator],
  [/freezer/i, Snowflake],
  [/air\s?condition|^ac\b/i, AirVent],
  [/television|\btv\b/i, Tv],
  [/washing/i, Wind],
  [/fan/i, Fan],
  [/oven|grill|convection/i, ChefHat],
  [/cook|kitchen|rice cooker|cookware/i, CookingPot],
  [/coffee/i, Coffee],
  [/water (heater|purifier)|geyser/i, Droplet],
  [/heater/i, Flame],
  [/sewing/i, Scissors],
  [/smart gadget|gadget/i, Zap],
  [/power|voltage|ips\b/i, BatteryCharging],
  [/phone|mobile/i, Smartphone],
  [/headphone|earphone|speaker|audio/i, Headphones],
  [/watch/i, Watch],
  [/camera/i, Camera],
  [/computer|laptop|accessories/i, Laptop],
  [/cable/i, Cable],
  [/usb|charger|hub/i, Usb],
  [/speaker/i, Speaker],
];

function getCategoryIcon(label: string) {
  const match = CATEGORY_ICON_RULES.find(([pattern]) => pattern.test(label));
  return match ? match[1] : Package;
}

// ─── Mega menu (Categories dropdown) ───────────────────────────────────────────
function CategoriesMegaMenu({ items }: { items: NavItem[] }) {
  return (
    <div
      className="absolute left-0 right-0 top-full z-[60] border-t border-gray-100 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.16)] animate-dropdown"
      role="menu"
    >
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid max-h-[65vh] grid-cols-2 gap-x-8 gap-y-7 overflow-y-auto pr-2 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => {
            const Icon = getCategoryIcon(item.label);
            return (
              <div key={item.label} className="min-w-0">
                <a
                  href={item.href}
                  role="menuitem"
                  className="mb-2.5 flex items-center gap-2 text-[14px] font-bold text-gray-900 hover:text-[#EE2430] transition-colors"
                >
                  <Icon className="h-[18px] w-[18px] shrink-0 text-[#EE2430]" />
                  <span className="truncate">{item.label}</span>
                </a>
                {!!item.children?.length && (
                  <ul className="space-y-1.5">
                    {item.children.map((sub) => (
                      <li key={sub.label}>
                        <a
                          href={sub.href}
                          role="menuitem"
                          className="block text-[13px] text-gray-600 hover:text-[#EE2430] transition-colors"
                        >
                          {sub.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Desktop nav item ──────────────────────────────────────────────────────────
function NavItemDesktop({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLeave = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, []);
  const scheduleClose = useCallback(() => {
    leaveTimer.current = setTimeout(() => setOpen(false), 150);
  }, []);

  useEffect(
    () => () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    },
    [],
  );

  return (
    <li
      className="relative static"
      onMouseEnter={() => {
        clearLeave();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <a
        href={item.href}
        aria-haspopup={item.hasDropdown ? "true" : undefined}
        aria-expanded={item.hasDropdown ? open : undefined}
        className={`flex items-center gap-1 px-4 py-4 text-[14px] font-semibold tracking-wide transition-colors duration-150 whitespace-nowrap ${
          open
            ? "bg-white/20 text-white"
            : "text-white/90 hover:text-white hover:bg-white/10"
        }`}
      >
        {item.label}
        {item.hasDropdown && (
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </a>

      {item.hasDropdown && !!item.children?.length && open && (
        <div
          onMouseEnter={() => {
            clearLeave();
            setOpen(true);
          }}
          onMouseLeave={scheduleClose}
        >
          <CategoriesMegaMenu items={item.children as unknown as NavItem[]} />
        </div>
      )}
    </li>
  );
}

// ─── Mobile nav item ───────────────────────────────────────────────────────────
function MobileNavItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const [activeSub, setActiveSub] = useState<string | null>(null);

  return (
    <li>
      <div className="flex w-full items-center justify-between border-b border-white/10 py-3">
        <a href={item.href} className="flex-1 text-sm font-semibold text-white">
          {item.label}
        </a>
        {item.hasDropdown && (
          <button
            onClick={() => {
              setOpen((v) => !v);
              setActiveSub(null);
            }}
            aria-label="Toggle submenu"
            className="p-1"
          >
            <ChevronDown
              className={`h-4 w-4 text-white transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      {item.hasDropdown && open && !!item.children?.length && (
        <ul className="mb-1 rounded-sm bg-white/10">
          {item.children.map((child) => {
            const Icon = getCategoryIcon(child.label);
            const hasSub = !!child.children?.length;
            const subOpen = activeSub === child.label;
            return (
              <li key={child.label}>
                <div className="flex w-full items-center justify-between border-b border-white/5 last:border-0">
                  <a
                    href={child.href}
                    className="flex flex-1 items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white/90 hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-[#EE2430]" />
                    {child.label}
                  </a>
                  {hasSub && (
                    <button
                      onClick={() => setActiveSub(subOpen ? null : child.label)}
                      className="px-3 py-2.5"
                      aria-label="Toggle nested"
                    >
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-white transition-transform duration-200 ${subOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
                {hasSub && subOpen && (
                  <ul className="bg-white/10">
                    {child.children!.map((sub) => (
                      <li key={sub.label}>
                        <a
                          href={sub.href}
                          className="block px-9 py-2 text-[12px] text-white/80 hover:text-white border-b border-white/5 last:border-0"
                        >
                          {sub.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

// ─── Main Header ───────────────────────────────────────────────────────────────
export function SiteHeader({
  brand,
  categories,
}: {
  brand: Brand;
  categories: ApiCategory[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // All API categories are collapsed into a single "Categories" mega-menu
  // trigger, matching the reference layout. "Brands" and "Campaigns" stay
  // as simple static links alongside it.
  const categoryColumns = mapCategories(categories);
  const nav: NavItem[] = [
    {
      label: "Categories",
      href: "/categories",
      hasDropdown: categoryColumns.length > 0,
      children: categoryColumns as unknown as NavChild[],
    },
    { label: "Brands", href: "/brand" },
    { label: "Campaigns", href: "/campaigns" },
    { label: "Support & Service", href: "/support-and-service" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <>
      <style>{`
                @keyframes dropdownIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-dropdown { animation: dropdownIn 0.15s ease-out forwards; }
            `}</style>

      {/* ── Utility strip: scrolls away with the page ── */}
      <div className="w-full bg-[#4B5563]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-[13px] text-white/85">
          <ul className="flex items-center gap-5">
            <li>
              <a href="/about" className="hover:text-white transition-colors">
                About
              </a>
            </li>
            <li>
              <a href="/b2b" className="hover:text-white transition-colors">
                B2B
              </a>
            </li>
            <li>
              <a
                href="/chat"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Chat
              </a>
            </li>
            <li>
              <a
                href="/locations"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" />
                Locations
              </a>
            </li>
          </ul>

          <ul className="flex items-center gap-5">
            <li>
              <a
                href="/customer/order-track"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <PackageSearch className="h-3.5 w-3.5" />
                Order Status
              </a>
            </li>
            <li>
              <AuthNavButton />
            </li>
          </ul>
        </div>
      </div>

      {/* ── Nav bar: logo, primary nav, search, cart — sticks to top independently ── */}
      <nav
        className="sticky top-0 z-50 w-full bg-[#4B5563] border-t border-white/10"
        aria-label="Main navigation"
      >
        <div className="relative mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
          <button
            className="flex items-center gap-2 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>

          <a href="/" className="flex shrink-0 items-center">
            <Image
              src={logo}
              alt={brand.name}
              width={110}
              height={36}
              priority
            />
          </a>

          <ul
            className="hidden flex-wrap items-center gap-1 lg:flex"
            role="menubar"
          >
            {nav.map((item) => (
              <NavItemDesktop key={item.label} item={item} />
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block">
              <SearchBar placeholder="Search Here" />
            </div>
            <CartButton />
          </div>
        </div>

        {mobileOpen && (
          <>
            <div className="border-t border-white/10 px-4 py-3 sm:hidden">
              <SearchBar placeholder="Search Here" />
            </div>
            <ul className="border-t border-white/10 px-4 pb-4 lg:hidden">
              {nav.map((item) => (
                <MobileNavItem key={item.label} item={item} />
              ))}
            </ul>
          </>
        )}
      </nav>
    </>
  );
}

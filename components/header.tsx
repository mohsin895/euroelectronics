"use client";

import { AuthNavButton } from "@/components/auth-nav-button";
import { useCart } from "@/lib/cart-context";
import {
  Building2,
  ChevronDown,
  Fan,
  FileText,
  Info,
  MapPin,
  Menu,
  MessageSquare,
  Refrigerator,
  Search,
  ShoppingCart,
  Smartphone,
  Snowflake,
  Soup,
  Sparkles,
  Tv,
  UtensilsCrossed,
  WashingMachine,
  Wind,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CartDrawer } from "./cart-drawer";

const BRAND = "#013E77";

const categoryGroups = [
  {
    column: [
      {
        title: "Refrigerator",
        slug: "refrigerator",
        icon: Refrigerator,
        color: "#C0392B",
        items: [
          { label: "Frost", slug: "frost" },
          { label: "No Frost", slug: "no-frost" },
          { label: "Side by Side", slug: "side-by-side" },
          { label: "Multi-Doors", slug: "multi-doors" },
          { label: "Semi-Commercial", slug: "semi-commercial" },
        ],
      },
      {
        title: "Freezer",
        slug: "freezer",
        icon: Snowflake,
        color: "#0E7C86",
        items: [],
      },
      {
        title: "Air Conditioner",
        slug: "air-conditioner",
        icon: Wind,
        color: "#D06A1E",
        items: [
          { label: "Non-Inverter", slug: "non-inverter" },
          { label: "Inverter", slug: "inverter" },
          { label: "Smart-Inverter", slug: "smart-inverter" },
        ],
      },
      {
        title: "Television",
        slug: "television",
        icon: Tv,
        color: "#C21A6B",
        items: [
          { label: "UHD/4K Smart TV", slug: "uhd-4k-smart-tv" },
          { label: "FHD/HD Smart TV", slug: "fhd-hd-smart-tv" },
        ],
      },
    ],
  },
  {
    column: [
      {
        title: "Washing Machine",
        slug: "washing-machine",
        icon: WashingMachine,
        color: "#0E7C86",
        items: [
          { label: "Front Load", slug: "front-load" },
          { label: "Top Load", slug: "top-load" },
          { label: "Semi-Auto", slug: "semi-auto" },
        ],
      },
      {
        title: "Oven",
        slug: "oven",
        icon: UtensilsCrossed,
        color: "#0E7C86",
        items: [
          { label: "Solo", slug: "solo" },
          { label: "Grill", slug: "grill" },
          { label: "Convection", slug: "convection" },
        ],
      },
      {
        title: "Kitchen Appliances",
        slug: "kitchen-appliances",
        icon: Soup,
        color: "#B8720A",
        items: [
          { label: "Rice Cooker", slug: "rice-cooker" },
          { label: "Blender & Grinder", slug: "blender-grinder" },
          { label: "Water Purifier", slug: "water-purifier" },
          { label: "Air Fryer", slug: "air-fryer" },
          { label: "Coffee Maker", slug: "coffee-maker" },
          { label: "Electric Kettle", slug: "electric-kettle" },
        ],
      },
    ],
  },
  {
    column: [
      {
        title: "Small Appliances",
        slug: "small-appliances",
        icon: Sparkles,
        color: "#B8720A",
        items: [
          { label: "Personal Care", slug: "personal-care" },
          { label: "Iron", slug: "iron" },
        ],
      },
      {
        title: "Sewing Machine",
        slug: "sewing-machine",
        icon: Soup,
        color: "#C21A6B",
        items: [
          { label: "Electric", slug: "electric" },
          { label: "Semi Industrial", slug: "semi-industrial" },
          { label: "Manual", slug: "manual" },
        ],
      },
      {
        title: "Water Heater",
        slug: "water-heater",
        icon: Snowflake,
        color: "#1F2937",
        items: [{ label: "Geyser", slug: "geyser" }],
      },
      {
        title: "Air Solution",
        slug: "air-solution",
        icon: Fan,
        color: "#0E7C86",
        items: [
          { label: "Fan", slug: "fan" },
          { label: "Air Purifier", slug: "air-purifier" },
          { label: "Room Heater", slug: "room-heater" },
        ],
      },
    ],
  },
  {
    column: [
      {
        title: "Smart Gadgets",
        slug: "smart-gadgets",
        icon: Smartphone,
        color: "#C21A6B",
        items: [
          { label: "Power Bank", slug: "power-bank" },
          { label: "Charger", slug: "charger" },
          { label: "Cable", slug: "cable" },
          { label: "Speaker", slug: "speaker" },
          { label: "Headphone", slug: "headphone" },
          { label: "Smartwatch", slug: "smartwatch" },
        ],
      },
    ],
  },
];

export function Header() {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: BRAND }}>
      {/* Utility top row */}
      <div className="hidden md:block border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between text-xs text-white/85">
          <div className="flex items-center gap-5">
            <Link
              href="/about"
              className="hover:text-white flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5" /> About
            </Link>
            <Link
              href="/b2b"
              className="hover:text-white flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" /> B2B
            </Link>
            <Link
              href="/chat"
              className="hover:text-white flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </Link>
            <Link
              href="/locations"
              className="hover:text-white flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" /> Locations
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/customer/order-track"
              className="hover:text-white flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> Order Status
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/signup" className="hover:text-white">
                Sign Up
              </Link>
              <span className="text-white/40">|</span>
              <Link href="/login" className="hover:text-white">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main row */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center gap-4 md:gap-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center shrink-0 bg-white rounded px-2 py-1"
        >
          <Image src="/logo.png" alt="EuroHome" width={72} height={60} />
        </Link>

        {/* Center nav */}
        <nav
          className="hidden md:flex items-center gap-8 h-full"
          onMouseLeave={() => setCategoriesOpen(false)}
        >
          <button
            onMouseEnter={() => setCategoriesOpen(true)}
            onClick={() => setCategoriesOpen((o) => !o)}
            className="flex items-center gap-1.5 h-full text-sm font-semibold text-white border-b-2 transition-colors"
            style={{ borderColor: categoriesOpen ? "#ffffff" : "transparent" }}
          >
            Categories
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${categoriesOpen ? "rotate-180" : ""}`}
            />
          </button>
          <Link
            href="/brand"
            className="text-sm font-medium text-white/90 hover:text-white"
          >
            Brands
          </Link>
          <Link
            href="/campaigns"
            className="text-sm font-medium text-white/90 hover:text-white"
          >
            Campaigns
          </Link>

          {/* Mega menu */}
          {categoriesOpen && (
            <div
              className="absolute left-0 right-0 top-full bg-white shadow-2xl border-t border-gray-100 z-50"
              onMouseEnter={() => setCategoriesOpen(true)}
            >
              <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-4 gap-x-10 gap-y-8 max-h-[70vh] overflow-y-auto">
                {categoryGroups.map((group, gi) => (
                  <div key={gi} className="space-y-7">
                    {group.column.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <div key={cat.slug}>
                          <Link
                            href={`/category/${cat.slug}`}
                            onClick={() => setCategoriesOpen(false)}
                            className="flex items-center gap-2 mb-2.5"
                          >
                            <Icon
                              className="w-[18px] h-[18px]"
                              style={{ color: cat.color }}
                            />
                            <span className="text-[15px] font-semibold text-gray-900">
                              {cat.title}
                            </span>
                          </Link>
                          <ul className="space-y-1.5 pl-[26px]">
                            {cat.items.map((item) => (
                              <li key={item.slug}>
                                <Link
                                  href={`/category/${cat.slug}/${item.slug}`}
                                  onClick={() => setCategoriesOpen(false)}
                                  className="text-sm text-gray-600 hover:text-[#013E77] transition-colors"
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-md ml-auto">
          <div className="flex items-center w-full bg-white rounded-full overflow-hidden pl-4">
            <input
              type="text"
              placeholder="Search Here"
              className="flex-1 h-9 text-sm outline-none text-gray-700 placeholder:text-gray-400"
            />
            <button
              className="h-9 w-11 flex items-center justify-center shrink-0"
              style={{ backgroundColor: BRAND }}
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4 ml-auto md:ml-0">
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ShoppingCart className="w-4.5 h-4.5 text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-[#013E77] text-[10px] rounded-full w-4.5 h-4.5 min-w-[18px] px-1 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex items-center w-full bg-white rounded-full overflow-hidden pl-4">
          <input
            type="text"
            placeholder="Search Here"
            className="flex-1 h-9 text-sm outline-none text-gray-700 placeholder:text-gray-400"
          />
          <button
            className="h-9 w-11 flex items-center justify-center shrink-0"
            style={{ backgroundColor: BRAND }}
          >
            <Search className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-4 border-t border-white/10 bg-white">
          <div className="space-y-3">
            <Link href="/" className="block text-sm font-medium text-gray-800">
              Home
            </Link>
            <Link
              href="/shop"
              className="block text-sm font-medium text-gray-800"
            >
              Shop
            </Link>
            <AuthNavButton />
          </div>
        </div>
      )}

      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </header>
  );
}

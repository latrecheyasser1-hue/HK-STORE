"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Menu, Phone, ShieldCheck, Truck } from "lucide-react";
import { DEPARTMENTS } from "@/data/storeData";

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenMenu: () => void;
  cartCount: number;
}

export default function Navbar({
  onOpenSearch,
  onOpenCart,
  onOpenMenu,
  cartCount,
}: NavbarProps) {
  const [lang, setLang] = useState<"FR" | "AR">("FR");

  return (
    <>
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#0A0A0C] text-[#FFFFFF] text-[11px] font-heading font-medium tracking-[0.14em] py-2 px-4 border-b border-[#1E2028]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#C5A880]">
              <Truck className="w-3.5 h-3.5" />
              LIVRAISON EXPRESS 58 WILAYAS (24H - 48H)
            </span>
            <span className="text-[#6B7280]">|</span>
            <span className="flex items-center gap-1.5 text-[#FFFFFF]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
              PAIEMENT À LA LIVRAISON APRÈS INSPECTION DU COLIS
            </span>
          </div>

          <div className="md:hidden flex items-center justify-center w-full text-center tracking-[0.18em]">
            <span>LIVRAISON 58 WILAYAS • الدفع عند الاستلام</span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:0792746456"
              className="flex items-center gap-1 text-[#C5A880] hover:text-[#FFFFFF] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>0792 74 64 56</span>
            </a>
            <span className="text-[#6B7280]">|</span>
            <button
              onClick={() => setLang(lang === "FR" ? "AR" : "FR")}
              className="hover:text-[#C5A880] font-semibold transition-colors"
            >
              {lang === "FR" ? "العربية" : "FRANÇAIS"}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Luxury Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E5E7EB] shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Left Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMenu}
              className="p-2 -ml-2 text-[#0A0A0C] hover:text-[#C5A880] transition-colors focus:outline-none"
              aria-label="Menu des univers"
            >
              <Menu className="w-6 h-6 stroke-[1.5]" />
            </button>

            <button
              onClick={onOpenSearch}
              className="hidden sm:flex items-center gap-2 p-2 text-[#0A0A0C] hover:text-[#C5A880] transition-colors focus:outline-none"
              aria-label="Recherche"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
              <span className="text-xs font-heading uppercase tracking-wider text-[#6B7280] hidden lg:inline">
                Rechercher...
              </span>
            </button>
          </div>

          {/* Centered Brand Logo */}
          <div className="flex flex-col items-center justify-center">
            <Link href="/" className="flex items-center justify-center group py-1">
              <img
                src="/images/hk-logo-light.png"
                alt="HK Store Chlef"
                className="h-10 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="sm:hidden p-2 text-[#0A0A0C] hover:text-[#C5A880] transition-colors focus:outline-none"
              aria-label="Recherche"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>

            <button
              onClick={onOpenCart}
              className="p-2 -mr-2 text-[#0A0A0C] hover:text-[#C5A880] transition-colors relative focus:outline-none"
              aria-label="Panier d'achat"
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#0A0A0C] text-[#FFFFFF] text-[10px] font-bold font-mono rounded-full flex items-center justify-center border-2 border-[#FFFFFF] shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 3. Desktop 8 Departments Mega-Bar */}
        <div className="hidden lg:block border-t border-[#F3F4F6] bg-[#FFFFFF]">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-7 py-2.5">
            {DEPARTMENTS.map((dept) => (
              <a
                key={dept.id}
                href={`#${dept.id}`}
                className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-[#111827] hover:text-[#C5A880] transition-colors whitespace-nowrap py-1 relative group"
              >
                <span>{dept.nameFr.replace(/^[0-9]+\.\s*/, "")}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#C5A880] group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}

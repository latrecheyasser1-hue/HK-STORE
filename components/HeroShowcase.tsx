"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Truck, Clock } from "lucide-react";

interface HeroShowcaseProps {
  onExplore: () => void;
  onExploreCoffrets: () => void;
}

export default function HeroShowcase({
  onExplore,
  onExploreCoffrets,
}: HeroShowcaseProps) {
  return (
    <section className="relative w-full overflow-hidden bg-[#0A0A0C] text-[#FFFFFF]">
      <div className="relative w-full min-h-[540px] md:min-h-[640px] flex items-center">
        {/* Background Image with Architectural Gradient */}
        <div className="absolute inset-0">
          <img
            src="https://lh3.googleusercontent.com/aida/AEtjO1WOMz1Rw1qk1sy7Vob_AARz2qpUyguBCsSU3uSai-5Wo3h5fnzCfXV3_A1ZNw5uP59tYi-K80lh0qm7XiKXDCPO5K_-ybubyr3bQW9H162AVPc3IOB85N3RGcZ1ft8ztxthl1m6IAscTzhnzYQ6i-XoVKnXhumtW7JqJUsARjtusOyiaD171dlOrhgJ_FuW0oF5i6sPTEHdc12ugnJ67XrIndDfJaEupT67sXfdsBT6NM8El28wQL_2fw"
            alt="HK Store Chlef Horlogerie & Coffrets Cadeaux"
            className="w-full h-full object-cover object-center filter brightness-[0.70] scale-105 transform hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0C]/80 via-transparent to-[#0A0A0C]/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col justify-end w-full">
          <div className="max-w-2xl">
            {/* Edition Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#18181B]/80 border border-[#C5A880]/40 backdrop-blur-sm mb-4">
              <span className="w-1.5 h-1.5 bg-[#C5A880]" />
              <span className="font-heading text-[10px] uppercase font-bold tracking-[0.25em] text-[#C5A880]">
                COLLECTION OFFICIELLE 2026 • CHLEF BOUTIQUE
              </span>
            </div>

            {/* Display Headings */}
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl uppercase tracking-[0.06em] text-[#FFFFFF] leading-[1.1]">
              L&apos;ÉLÉGANCE À PORTÉE DE MAIN
            </h1>

            {/* Arabic Calligraphy Accent */}
            <p className="font-arabic font-bold text-lg sm:text-2xl text-[#C5A880] mt-3 tracking-wide">
              فخامة تليق بك وبأحبابك — الدفع نقداً عند الاستلام بعد المعاينة
            </p>

            <p className="font-sans text-sm sm:text-base text-[#D4D4D8] mt-3 max-w-lg leading-relaxed font-light">
              Découvrez notre sélection exclusive de chronographes, coffrets VIP, parfums intenses et accessoires de luxe avec livraison rapide dans les 58 Wilayas.
            </p>

            {/* Dual High-Impact Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 mt-8">
              <button
                type="button"
                onClick={onExplore}
                className="w-full sm:w-auto h-13 px-8 bg-[#FFFFFF] hover:bg-[#C5A880] text-[#0A0A0C] hover:text-[#FFFFFF] font-heading font-bold text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2.5 transition-all shadow-md group"
              >
                <span>DÉCOUVRIR LE CATALOGUE</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[1.5]" />
              </button>

              <button
                type="button"
                onClick={onExploreCoffrets}
                className="w-full sm:w-auto h-13 px-8 bg-transparent hover:bg-[#FFFFFF]/10 border border-[#FFFFFF]/80 hover:border-[#C5A880] text-[#FFFFFF] hover:text-[#C5A880] font-heading font-bold text-xs uppercase tracking-[0.16em] flex items-center justify-center transition-all"
              >
                <span>VOIR LES COFFRETS VIP</span>
              </button>
            </div>

            {/* Trust Mini Strip */}
            <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-[#27272A]/80 text-[#A1A1AA] text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C5A880] shrink-0 stroke-[1.5]" />
                <span className="text-[11px] font-medium">58 Wilayas Yalidine</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0 stroke-[1.5]" />
                <span className="text-[11px] font-medium">Inspection avant paiement</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C5A880] shrink-0 stroke-[1.5]" />
                <span className="text-[11px] font-medium">Garantie 100% Qualité</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

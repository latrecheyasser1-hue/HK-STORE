"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { Product } from "@/data/storeData";

interface StickyBottomMobileBarProps {
  onQuickOrder: () => void;
  featuredProduct: Product;
}

export default function StickyBottomMobileBar({
  onQuickOrder,
  featuredProduct,
}: StickyBottomMobileBarProps) {
  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-[#0A0A0C]/95 backdrop-blur-md border-t border-[#27272A] p-3 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-[#C5A880] font-heading font-bold">
            PRIX EXCLUSIF
          </span>
          <span className="font-heading font-extrabold text-sm text-[#FFFFFF] font-mono">
            {featuredProduct.price.toLocaleString()} DZD
          </span>
        </div>

        <button
          type="button"
          onClick={onQuickOrder}
          className="flex-1 h-12 bg-[#FFFFFF] active:bg-[#C5A880] text-[#0A0A0C] font-heading font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md"
        >
          <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
          <span>COMMANDER MAINTENANT (COD)</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, Ban } from "lucide-react";
import { Product } from "@/data/storeData";

interface ProductCardProps {
  product: Product;
  onQuickBuy?: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const isOutOfStock = (product.stockQuantity ?? 1) <= 0;

  return (
    <div
      className={`bg-[#FFFFFF] border flex flex-col justify-between transition-all group relative overflow-hidden ${
        isOutOfStock
          ? "border-[#E5E7EB] opacity-90"
          : "border-[#E5E7EB] hover:border-[#0A0A0C]"
      }`}
    >
      {/* Image Area */}
      <Link
        href={`/product/${product.id}`}
        className="relative aspect-[4/5] bg-[#F7F7F8] overflow-hidden block"
      >
        {/* Banner ÉPUISÉ / نفد من المخزون */}
        {isOutOfStock && (
          <div className="absolute top-0 inset-x-0 z-30 bg-[#DC2626] text-[#FFFFFF] py-2 px-3 shadow-lg flex items-center justify-between border-b-2 border-[#B91C1C]">
            <span className="font-heading font-black text-[11px] sm:text-xs tracking-widest uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              ÉPUISÉ
            </span>
            <span className="font-arabic font-extrabold text-[11px] sm:text-xs dir-rtl">
              نَفِدَ من المخزون
            </span>
          </div>
        )}

        <img
          src={product.image}
          alt={product.title}
          style={isOutOfStock ? { filter: "grayscale(100%) contrast(75%)", opacity: 0.55 } : undefined}
          className={`w-full h-full object-cover object-center transition-all duration-500 ${
            isOutOfStock
              ? "grayscale contrast-75 opacity-50"
              : "group-hover:scale-105"
          }`}
        />
      </Link>

      {/* Content Block */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category */}
          <div className="flex items-center justify-between">
            <span className="font-heading text-[9px] uppercase font-bold tracking-widest text-[#C5A880]">
              {product.category}
            </span>
            {isOutOfStock && (
              <span className="text-[9px] font-heading font-bold text-[#DC2626] uppercase tracking-wider">
                0 en stock
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/product/${product.id}`} className="block">
            <h3
              className={`font-heading font-bold text-xs sm:text-sm uppercase tracking-tight mt-1 line-clamp-2 transition-colors ${
                isOutOfStock
                  ? "text-[#6B7280]"
                  : "text-[#0A0A0C] hover:text-[#C5A880]"
              }`}>
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="mt-4 pt-3 border-t border-[#F3F4F6]">
          <div className="flex items-baseline justify-between mb-3">
            <span
              className={`font-heading font-extrabold text-sm sm:text-base tracking-tight ${
                isOutOfStock ? "text-[#9CA3AF]" : "text-[#0A0A0C]"
              }`}>
              {product.price.toLocaleString()} DZD
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#9CA3AF] line-through font-sans">
                {product.originalPrice.toLocaleString()} DZD
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="w-full h-11 bg-[#F4F4F5] text-[#9CA3AF] border border-[#E4E4E7] font-heading font-bold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed select-none opacity-80"
            >
              <Ban className="w-4 h-4 stroke-[2] text-[#DC2626]" />
              <span className="text-[#6B7280]">RUPTURE DE STOCK • نَفِدَ</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product);
              }}
              className="w-full h-11 bg-[#0A0A0C] hover:bg-[#C5A880] text-[#FFFFFF] hover:text-[#0A0A0C] font-heading font-bold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              <span>AJOUTER AU PANIER</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

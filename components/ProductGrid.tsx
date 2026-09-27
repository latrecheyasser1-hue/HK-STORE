"use client";

import React from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/data/storeData";

interface ProductGridProps {
  products: Product[];
  onQuickBuy: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({
  products,
  onQuickBuy,
  onAddToCart,
}: ProductGridProps) {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto" id="catalog-bestsellers">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between pb-6 mb-8 border-b border-[#E5E7EB] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 justify-center sm:justify-start">
            <span className="w-2 h-2 bg-[#DC2626]" />
            <span className="font-heading text-[10px] uppercase font-bold tracking-[0.25em] text-[#DC2626]">
              EXPÉDITION IMMÉDIATE YALIDINE 58 WILAYAS
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0A0A0C] uppercase tracking-[0.06em] text-center sm:text-left">
            MEILLEURES VENTES & COFFRETS
          </h2>
          <p className="font-arabic font-bold text-sm text-[#6B7280] text-center sm:text-left">
            المنتجات الأكثر طلباً في متجر الشلف — إمكانية المعاينة قبل الدفع كاش
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="font-mono text-xs text-[#6B7280]">
            {products.length} ARTICLES DISPONIBLES
          </span>
        </div>
      </div>

      {/* Grid: 4 columns desktop / 2 columns mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickBuy={onQuickBuy}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Watch,
  Gift,
  Glasses,
  Flame,
  CheckCircle,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { FEATURED_PRODUCTS, DEPARTMENTS, Product } from "@/data/storeData";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  onSelectProduct,
}: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll when modal is open & autofocus input
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "unset";
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Curated MVMT-style trending searches
  const trendingSearches = [
    "Montre Chrono Phantom",
    "Coffret Royal Black",
    "Montre Femme Dorée",
    "Lunettes Aviateur",
    "Extrait de Parfum",
    "Maroquinerie & Sacs",
  ];

  // Quick collection shortcuts matching MVMT style
  const quickCollections = [
    {
      name: "Montres Hommes",
      tag: "montres",
      image: "https://lh3.googleusercontent.com/aida/AEtjO1XzJjlK_t2Aw34By9eINLZqBDJdXXP-Dp0ceDr55wa5FBX68qy6xFBTjSU-x3Y9bmVWiqRgH5Hf7Z71fHJ2S-hQMk-EftXaUbHss6wQb9JW-86BBKOTJf7k5jqKlOgSorGdtOVQ5HD1Pq1Fc3wICCVlotE9Ukc-1sdBLJVud2MbjDWL2RcGyqUgRCAc4e3v3KsvBFTAglHbRFf2_kmj5giUhSVBq7aY9EGKPuzr6dexho3CpvVuzm15TQ",
      query: "Montre Homme",
    },
    {
      name: "Coffrets Cadeaux",
      tag: "coffrets",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_DcN3Upqx9Zuj8y2p8ytcNJyBdp9gHtevPj_UNEltZKkN5jFkB-v047v7DD6nlDKdNHL1wsnahaD-z3pAkUwFNOXT5cUvt5zh-QwSjbXN4xULww-F4yYttl8o0ea8rzDtlxMcktGt4635w9Z2IfSHJO_uT7ZVRs08YgLhJ0o6zqPTlxFqLNgTnm3SOkfodA0MfD-0biJfhHnp5n6JqzqG9JuRlRQbNzRV0eb7QHyL4k-cbMjJa_zP",
      query: "Coffret",
    },
    {
      name: "Montres Femmes",
      tag: "montres",
      image: "https://lh3.googleusercontent.com/aida/AEtjO1XpP0ENYC5JiY9LJ4RYdVGZTXsWbsTs3Q4ymiKYKjXv22mEThiUFsZsMAeBfqvAfZ2q3ZIK5UDIFjSKdfvmPWWZBdDsE8CiQN6w19IIxPaNS88qAllGfPAg3198qDKMJ4ZJfEOn0b3DKs10_x9LCgG6v7Vgvc3ziMc7L6pjBoQb5faazKVC18Z8jkAVO_eJyBehUuz-8p16Yc-yCpGhFuoJO-wBMyuBRTtGuwWCvm7sdGkIPI86YdbYtA",
      query: "Femme",
    },
    {
      name: "Lunettes Solaires",
      tag: "lunettes",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA3DFFISzjmB1crUOlTX-yOxT_kHRSEqN0jL1Ls8o_WiVeyxFIKPpBhmpaMmIJ7d9bAbvuA372NL1LQ1o3p84x21rpFG1GBwNKXsOLklLEyYFqOjkqa9A4EoNiZVWSQNIdo0h-wUOa5Yrvf4ijCUlNEgLSTfHnToykUoARsSmn959S0t2fCHB9dnsRYjeVB1ix0o5TXHMcA8iua0750Z1AUjstblaIrK1hgTfp_RowV9yjCRxE8wYo",
      query: "Lunettes",
    },
  ];

  // Predictive search query filtering
  const query = searchTerm.trim().toLowerCase();
  const isQueryActive = query.length > 0;

  const filteredProducts = isQueryActive
    ? FEATURED_PRODUCTS.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(query);
        const catMatch = p.category.toLowerCase().includes(query);
        const arMatch = p.subtitleArabic.toLowerCase().includes(query) || p.categoryArabic.toLowerCase().includes(query);
        const descMatch = p.description.toLowerCase().includes(query);
        const genderMatch = p.gender ? p.gender.toLowerCase().includes(query) : false;
        return titleMatch || catMatch || arMatch || descMatch || genderMatch;
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0C] text-[#FAFAFA] animate-fadeIn">
      {/* Top Bar / Search Input Container (MVMT Mobile Style) */}
      <div className="sticky top-0 z-10 bg-[#0A0A0C] border-b border-[#222328] px-4 sm:px-6 py-3.5 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          {/* Search Input Form */}
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 absolute left-3.5 text-[#C5A880] pointer-events-none stroke-[1.75]" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher des montres, coffrets, lunettes..."
              className="w-full h-12 pl-11 pr-10 bg-[#141518] border border-[#27272A] focus:border-[#C5A880] text-sm sm:text-base text-[#FFFFFF] placeholder:text-[#6B7280] font-sans tracking-wide transition-all focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  inputRef.current?.focus();
                }}
                aria-label="Effacer le texte"
                className="absolute right-3 w-6 h-6 flex items-center justify-center rounded-full bg-[#27272A] text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors"
              >
                <X className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            )}
          </div>

          {/* Close Action Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la recherche"
            className="h-12 px-3 flex items-center justify-center text-xs font-heading font-bold uppercase tracking-[0.18em] text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors focus:outline-none"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Main Drawer Body (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full">
        {isQueryActive ? (
          /* Live Predictive Results */
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#222328]">
              <div className="flex items-center gap-2">
                <span className="font-heading text-xs uppercase tracking-[0.2em] font-extrabold text-[#FFFFFF]">
                  Produits
                </span>
                <span className="text-[11px] font-mono font-bold text-[#C5A880] bg-[#C5A880]/10 px-2 py-0.5 border border-[#C5A880]/20">
                  {filteredProducts.length}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#71717A]">
                Disponibles à Chlef (58 Wilayas)
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="flex flex-col divide-y divide-[#1D1E24]">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product.id);
                      onClose();
                    }}
                    className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#121316] px-2 -mx-2 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Product Thumbnail (MVMT Square Aspect) */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#141518] shrink-0 border border-[#27272A] overflow-hidden relative">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.badge && (
                          <span className="absolute top-1 left-1 bg-[#0A0A0C]/90 text-[#C5A880] border border-[#C5A880]/40 text-[8px] font-heading font-extrabold px-1 py-0.2 tracking-wider">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      {/* Product Metadata */}
                      <div className="flex flex-col justify-center">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#C5A880] font-heading font-bold mb-0.5">
                          {product.category}
                        </span>
                        <h4 className="font-heading text-xs sm:text-sm font-bold text-[#FFFFFF] group-hover:text-[#C5A880] transition-colors uppercase tracking-tight line-clamp-1">
                          {product.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-heading text-xs sm:text-sm font-extrabold text-[#FFFFFF] font-mono">
                            {product.price.toLocaleString()} DZD
                          </span>
                          {product.originalPrice && (
                            <span className="text-[11px] line-through text-[#71717A] font-mono">
                              {product.originalPrice.toLocaleString()} DZD
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-[#22C55E] flex items-center gap-1 mt-0.5 font-sans">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                          En stock • Expédition 24h
                        </span>
                      </div>
                    </div>

                    {/* Arrow CTA */}
                    <div className="shrink-0 w-8 h-8 rounded-full border border-[#27272A] group-hover:border-[#C5A880] group-hover:bg-[#C5A880] flex items-center justify-center text-[#71717A] group-hover:text-[#0A0A0C] transition-all">
                      <ArrowRight className="w-4 h-4 stroke-[2]" />
                    </div>
                  </div>
                ))}

                {/* Bottom View All Button */}
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      if (filteredProducts.length > 0) {
                        onSelectProduct(filteredProducts[0].id);
                        onClose();
                      }
                    }}
                    className="w-full py-3.5 bg-[#FFFFFF] active:bg-[#C5A880] text-[#0A0A0C] font-heading font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Voir tous les résultats pour « {searchTerm} »</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Empty State when no results found */
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#71717A] mb-4">
                  <Search className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="font-heading text-sm uppercase tracking-[0.2em] font-bold text-[#FFFFFF] mb-2">
                  Aucun résultat pour « {searchTerm} »
                </h4>
                <p className="text-xs text-[#A1A1AA] max-w-sm mb-6 leading-relaxed">
                  Vérifiez l’orthographe ou effectuez une recherche avec des termes plus généraux tels que Montre, Coffret, Parfum ou Lunettes.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {trendingSearches.slice(0, 3).map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setSearchTerm(term)}
                      className="px-3.5 py-1.5 bg-[#18181B] border border-[#27272A] hover:border-[#C5A880] text-[10px] uppercase tracking-wider font-heading text-[#FFFFFF] transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Initial State (MVMT Style Trending + Collections) */
          <div className="space-y-8">
            {/* Trending Searches Pills */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[#C5A880] stroke-[1.75]" />
                <h3 className="font-heading text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#FFFFFF]">
                  Recherches Tendances
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearchTerm(term)}
                    className="px-3.5 py-2 bg-[#141518] hover:bg-[#1E2028] border border-[#27272A] hover:border-[#C5A880] text-[#D1D5DB] hover:text-[#FFFFFF] text-xs font-sans tracking-wide transition-all flex items-center gap-1.5"
                  >
                    <Search className="w-3 h-3 text-[#C5A880]" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MVMT Popular Collections Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#FFFFFF]">
                  Explorer par Catégorie
                </h3>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#71717A]">
                  Collections Phares
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {quickCollections.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSearchTerm(col.query)}
                    className="group relative h-28 sm:h-32 border border-[#27272A] hover:border-[#C5A880] overflow-hidden bg-[#141518] text-left transition-all"
                  >
                    <img
                      src={col.image}
                      alt={col.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/50 to-transparent" />
                    <div className="absolute inset-x-2.5 bottom-2.5 flex items-end justify-between">
                      <span className="font-heading text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#FFFFFF] group-hover:text-[#C5A880] transition-colors">
                        {col.name}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C5A880] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Best Sellers Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C5A880] stroke-[1.75]" />
                  <h3 className="font-heading text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#FFFFFF]">
                    Meilleures Ventes Actuelles
                  </h3>
                </div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#C5A880] font-heading font-bold">
                  Top Sélections
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FEATURED_PRODUCTS.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product.id);
                      onClose();
                    }}
                    className="p-2.5 bg-[#141518]/90 border border-[#222328] hover:border-[#C5A880] flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#0A0A0C] shrink-0 border border-[#27272A] overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-heading text-[11px] font-bold text-[#FFFFFF] group-hover:text-[#C5A880] line-clamp-1 transition-colors uppercase">
                          {product.title}
                        </span>
                        <span className="font-heading text-xs font-extrabold text-[#C5A880] font-mono mt-0.5">
                          {product.price.toLocaleString()} DZD
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-[#C5A880] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

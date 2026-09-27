"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  SlidersHorizontal,
  ShoppingBag,
  RotateCcw,
  X
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import MegaNavDrawer from "@/components/MegaNavDrawer";
import CartDrawer, { CartItem } from "@/components/CartDrawer";
import QuickCODModal from "@/components/QuickCODModal";
import ProductCard from "@/components/ProductCard";
import TrustReassurance from "@/components/TrustReassurance";
import { DEPARTMENTS, FEATURED_PRODUCTS, Product } from "@/data/storeData";

export default function CollectionPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CollectionContent params={params} />
    </Suspense>
  );
}

function CollectionContent({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const subQuery = searchParams.get("sub");
  const catSlug = resolvedParams.category;

  const currentDept =
    DEPARTMENTS.find((d) => d.slug.toLowerCase() === catSlug.toLowerCase()) || {
      id: "dept-all",
      slug: "tous",
      nameFr: "Toutes les Collections",
      nameAr: "جميع الأقسام والمنتجات",
      image: "",
      iconName: "Sparkles",
      subcategories: [],
    };

  // Determine initial subcategory (prefer URL ?sub=, otherwise default to first available branch)
  const matchedSub = currentDept.subcategories?.find((s) => s.slug === subQuery);
  const defaultSub = matchedSub?.slug || currentDept.subcategories?.[0]?.slug || "all";

  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [selectedSubcat, setSelectedSubcat] = useState<string>(defaultSub);

  // Sync state whenever the ?sub= parameter in the URL changes
  useEffect(() => {
    if (subQuery && currentDept.subcategories?.some((s) => s.slug === subQuery)) {
      setSelectedSubcat(subQuery);
    } else if (currentDept.subcategories && currentDept.subcategories.length > 0 && selectedSubcat === "all") {
      setSelectedSubcat(currentDept.subcategories[0].slug);
    }
  }, [subQuery, currentDept]);

  // Advanced Filter States (Homme / Femme & Price Range)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState<"all" | "homme" | "femme">("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // Global modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProductForCOD, setSelectedProductForCOD] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Count active filters
  const activeFilterCount =
    (selectedGender !== "all" ? 1 : 0) +
    (minPrice !== "" ? 1 : 0) +
    (maxPrice !== "" ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedGender("all");
    setMinPrice("");
    setMaxPrice("");
    if (currentDept.subcategories && currentDept.subcategories.length > 0) {
      setSelectedSubcat(currentDept.subcategories[0].slug);
    } else {
      setSelectedSubcat("all");
    }
  };

  // Base Category Filter
  let products =
    catSlug === "tous" || catSlug === "all"
      ? FEATURED_PRODUCTS
      : FEATURED_PRODUCTS.filter((p) => {
          const cat = p.category.toLowerCase();
          if (catSlug.includes("montre")) return cat.includes("montre");
          if (catSlug.includes("coffret")) return cat.includes("coffret");
          if (catSlug.includes("lunette")) return cat.includes("lunette");
          if (catSlug.includes("parfum")) return cat.includes("parfum");
          if (catSlug.includes("maroquinerie") || catSlug.includes("sac"))
            return cat.includes("sac") || cat.includes("maroquinerie");
          return true;
        });

  // Targeted Subcategory / Branch Filter
  if (selectedSubcat && selectedSubcat !== "all") {
    products = products.filter((p) => {
      const sub = selectedSubcat.toLowerCase();
      const title = p.title.toLowerCase();
      const cat = p.category.toLowerCase();
      const catAr = (p.categoryArabic || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();

      // Montres
      if (sub === "montres-hommes") {
        return p.gender === "homme" || title.includes("homme");
      }
      if (sub === "montres-femmes") {
        return p.gender === "femme" || title.includes("femme") || title.includes("nacre") || title.includes("rose");
      }

      // Coffrets
      if (sub === "coffrets-hommes-vip") {
        return p.gender === "homme" || title.includes("homme") || title.includes("royal black");
      }
      if (sub === "coffrets-femmes-luxe") {
        return p.gender === "femme" || title.includes("femme") || title.includes("dorée") || title.includes("doree");
      }

      // Lunettes
      if (sub === "lunettes-hommes") {
        return p.gender === "homme" || title.includes("homme") || title.includes("aviateur") || title.includes("titane");
      }
      if (sub === "lunettes-femmes") {
        return p.gender === "femme" || title.includes("femme") || title.includes("papillon") || title.includes("cat-eye");
      }

      // Maroquinerie
      if (sub === "sacoches-hommes") {
        return title.includes("sacoche") || desc.includes("sacoche") || (cat.includes("sac") && p.gender === "homme");
      }
      if (sub === "portefeuilles") {
        return title.includes("portefeuille") || desc.includes("portefeuille") || title.includes("porte-carte");
      }
      if (sub === "sacs-femmes") {
        return title.includes("sac à main") || (cat.includes("sac") && p.gender === "femme");
      }
      if (sub === "ceintures") {
        return title.includes("ceinture") || desc.includes("ceinture");
      }

      // Vêtements
      if (sub === "sous-vetements") {
        return title.includes("sous-vêtement") || title.includes("boxer") || p.gender === "homme";
      }
      if (sub === "ensembles-priere") {
        return title.includes("prière") || title.includes("priere") || title.includes("ensemble") || p.gender === "femme";
      }

      // Parfumerie
      if (sub === "parfums-hommes") {
        return p.gender === "homme" || title.includes("homme");
      }
      if (sub === "parfums-femmes") {
        return p.gender === "femme" || title.includes("femme") || title.includes("aurelia");
      }
      if (sub === "mini-cadeaux") {
        return title.includes("mini") || title.includes("cadeau") || title.includes("favor") || title.includes("توزيع");
      }
      if (sub === "brumes") {
        return title.includes("brume") || desc.includes("brume");
      }

      // Accessoires
      if (sub === "bagues") {
        return title.includes("bague") || desc.includes("bague");
      }
      if (sub === "colliers") {
        return title.includes("collier") || desc.includes("collier") || title.includes("chaîne");
      }
      if (sub === "bracelets") {
        return title.includes("gourmette") || title.includes("bracelet") || desc.includes("bracelet");
      }
      if (sub === "boucles") {
        return title.includes("boucle") || desc.includes("boucle") || title.includes("créole");
      }

      // Generic gender / keyword fallback
      if (sub.includes("homme")) {
        return p.gender === "homme" || title.includes("homme") || cat.includes("homme") || catAr.includes("رجال");
      }
      if (sub.includes("femme")) {
        return p.gender === "femme" || title.includes("femme") || cat.includes("femme") || catAr.includes("نسا");
      }

      return true;
    });
  }

  // Gender Filter (Homme / Femme / Tous)
  if (selectedGender === "homme") {
    products = products.filter((p) => {
      const t = p.title.toLowerCase();
      const c = p.category.toLowerCase();
      const ar = p.categoryArabic.toLowerCase();
      return (
        p.gender === "homme" ||
        p.gender === "unisex" ||
        t.includes("homme") ||
        c.includes("homme") ||
        ar.includes("رجال")
      );
    });
  } else if (selectedGender === "femme") {
    products = products.filter((p) => {
      const t = p.title.toLowerCase();
      const c = p.category.toLowerCase();
      const ar = p.categoryArabic.toLowerCase();
      return (
        p.gender === "femme" ||
        p.gender === "unisex" ||
        t.includes("femme") ||
        c.includes("femme") ||
        ar.includes("نسا")
      );
    });
  }

  // Min / Max Price Filter
  if (minPrice !== "") {
    const min = Number(minPrice);
    if (!isNaN(min) && min > 0) {
      products = products.filter((p) => p.price >= min);
    }
  }
  if (maxPrice !== "") {
    const max = Number(maxPrice);
    if (!isNaN(max) && max > 0) {
      products = products.filter((p) => p.price <= max);
    }
  }

  // Sort
  if (sortBy === "price-asc") {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    products = [...products].sort((a, b) => b.price - a.price);
  }

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#111827]">
      {/* Navigation */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        cartCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
      />

      <main className="flex-1">
        {/* Collection Header Bar */}
        <div className="bg-[#FFFFFF] border-b border-[#E5E7EB] py-4 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Link href="/" className="hover:text-[#0A0A0C] transition-colors flex items-center gap-1 font-heading uppercase tracking-wider text-[#6B7280]">
                <ChevronLeft className="w-3.5 h-3.5" />
                Accueil
              </Link>
              <span className="text-[#D1D5DB]">/</span>
              <span className="font-heading uppercase tracking-wider text-[#0A0A0C] font-extrabold text-sm sm:text-base">
                {currentDept.nameFr.replace(/^[0-9]+\.\s*/, "")}
              </span>
              {currentDept.nameAr && (
                <span className="font-arabic text-xs text-[#9CA3AF] hidden sm:inline mr-2">
                  ({currentDept.nameAr})
                </span>
              )}
            </div>
            <span className="text-xs font-mono uppercase text-[#C5A880] font-bold">
              {products.length} Modèles
            </span>
          </div>
        </div>

        {/* Filters and Sorting Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 border-b border-[#E5E7EB]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Subcategory / Branches Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {currentDept.subcategories?.map((sub) => (
                <button
                  key={sub.slug}
                  type="button"
                  onClick={() => {
                    setSelectedSubcat(sub.slug);
                    router.replace(`/collection/${catSlug}?sub=${sub.slug}`, { scroll: false });
                  }}
                  className={`px-3.5 py-1.5 text-xs font-heading font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSubcat === sub.slug
                      ? "bg-[#0A0A0C] text-[#FFFFFF]"
                      : "bg-[#F7F7F8] text-[#4B5563] hover:text-[#0A0A0C] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {sub.nameFr}
                </button>
              ))}
            </div>

            {/* Right side: Interactive FILTRER Button + Sort Selector */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`h-9 px-3.5 border text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  isFilterOpen || activeFilterCount > 0
                    ? "bg-[#0A0A0C] text-[#FFFFFF] border-[#0A0A0C]"
                    : "bg-[#FFFFFF] text-[#0A0A0C] border-[#0A0A0C] hover:bg-[#F7F7F8]"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>FILTRER</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#C5A880] text-[#0A0A0C] text-[10px] font-mono font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {/* Collapsible Luxury Filter Panel */}
          {isFilterOpen && (
            <div className="mt-4 pt-5 pb-4 border-t border-[#E5E7EB] bg-[#FBFBFC] p-4 sm:p-6 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                {/* 1. Genre: Homme / Femme / Tous */}
                <div className="md:col-span-4">
                  <label className="block text-[11px] font-heading font-bold uppercase tracking-widest text-[#0A0A0C] mb-2">
                    Genre / Catégorie :
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedGender("all")}
                      className={`h-9 px-2 text-xs font-heading font-bold uppercase tracking-wider border transition-all ${
                        selectedGender === "all"
                          ? "bg-[#0A0A0C] text-[#FFFFFF] border-[#0A0A0C]"
                          : "bg-[#FFFFFF] text-[#4B5563] border-[#E5E7EB] hover:border-[#0A0A0C]"
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedGender("homme")}
                      className={`h-9 px-2 text-xs font-heading font-bold uppercase tracking-wider border transition-all ${
                        selectedGender === "homme"
                          ? "bg-[#0A0A0C] text-[#FFFFFF] border-[#0A0A0C]"
                          : "bg-[#FFFFFF] text-[#4B5563] border-[#E5E7EB] hover:border-[#0A0A0C]"
                      }`}
                    >
                      Homme (رجالي)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedGender("femme")}
                      className={`h-9 px-2 text-xs font-heading font-bold uppercase tracking-wider border transition-all ${
                        selectedGender === "femme"
                          ? "bg-[#0A0A0C] text-[#FFFFFF] border-[#0A0A0C]"
                          : "bg-[#FFFFFF] text-[#4B5563] border-[#E5E7EB] hover:border-[#0A0A0C]"
                      }`}
                    >
                      Femme (نسائي)
                    </button>
                  </div>
                </div>

                {/* 2. Fourchette de Prix (Min DZD & Max DZD) */}
                <div className="md:col-span-5">
                  <label className="block text-[11px] font-heading font-bold uppercase tracking-widest text-[#0A0A0C] mb-2">
                    Fourchette de Prix (DZD) :
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        placeholder="Min DZD"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full h-9 px-3 bg-[#FFFFFF] border border-[#E5E7EB] text-xs font-mono text-[#0A0A0C] focus:outline-none focus:border-[#0A0A0C]"
                      />
                    </div>
                    <span className="text-xs font-bold text-[#9CA3AF]">—</span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        placeholder="Max DZD"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full h-9 px-3 bg-[#FFFFFF] border border-[#E5E7EB] text-xs font-mono text-[#0A0A0C] focus:outline-none focus:border-[#0A0A0C]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Actions: Reset & Done */}
                <div className="md:col-span-3 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="h-9 px-3 text-xs font-heading font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#DC2626] transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Réinitialiser</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="h-9 px-4 bg-[#0A0A0C] hover:bg-[#C5A880] text-[#FFFFFF] hover:text-[#0A0A0C] text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Appliquer ({products.length})
                  </button>
                </div>
              </div>

              {/* Active Filter Tags */}
              {activeFilterCount > 0 && (
                <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#6B7280]">
                    Filtres actifs :
                  </span>
                  {selectedGender !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFFFFF] border border-[#0A0A0C] text-xs font-heading font-bold uppercase text-[#0A0A0C]">
                      Genre: {selectedGender === "homme" ? "Homme" : "Femme"}
                      <button type="button" onClick={() => setSelectedGender("all")} className="hover:text-[#DC2626]">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {(minPrice || maxPrice) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFFFFF] border border-[#0A0A0C] text-xs font-heading font-bold uppercase text-[#0A0A0C]">
                      Prix: {minPrice || "0"} - {maxPrice || "Max"} DZD
                      <button type="button" onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="hover:text-[#DC2626]">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#DC2626] hover:underline ml-2"
                  >
                    Effacer tout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Product Grid or Empty State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {products.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-[#E5E7EB] p-8">
              <h3 className="font-heading font-bold text-base uppercase text-[#0A0A0C]">
                Aucun produit ne correspond à ces critères
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 font-sans">
                Essayez d'ajuster ou de réinitialiser la fourchette de prix ou le genre sélectionné.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-[#0A0A0C] text-[#FFFFFF] text-xs font-heading font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#0A0A0C] transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickBuy={(p) => setSelectedProductForCOD(p)}
                  onAddToCart={(p) => handleAddToCart(p)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trust Reassurance */}
        <TrustReassurance />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <QuickCODModal
        isOpen={!!selectedProductForCOD}
        onClose={() => setSelectedProductForCOD(null)}
        product={selectedProductForCOD}
        onSuccess={() => setSelectedProductForCOD(null)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(id) => {
          setIsSearchOpen(false);
          router.push(`/product/${id}`);
        }}
      />

      <MegaNavDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, delta) => {
          setCartItems((prev) =>
            prev
              .map((item) => {
                if (item.product.id === id) {
                  const newQty = item.quantity + delta;
                  return newQty > 0 ? { ...item, quantity: newQty } : null;
                }
                return item;
              })
              .filter(Boolean) as CartItem[]
          );
        }}
        onRemoveItem={(id) => setCartItems((prev) => prev.filter((i) => i.product.id !== id))}
        onCheckout={() => {
          setIsCartOpen(false);
          if (cartItems.length > 0) {
            setSelectedProductForCOD(cartItems[0].product);
          }
        }}
      />
    </div>
  );
}

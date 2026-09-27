"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  ArrowRight,
  Watch,
  Diamond,
  Gift,
  Sparkles,
  Eye,
  Sun,
  Briefcase,
  CreditCard,
  Shirt,
  Flame,
  Home,
  CircleDot,
  Link2,
  Truck,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Phone,
  Compass,
  Lock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Ban
} from "lucide-react";
import SearchModal from "@/components/SearchModal";
import CartDrawer, { CartItem } from "@/components/CartDrawer";
import QuickCODModal from "@/components/QuickCODModal";
import { DEPARTMENTS, FEATURED_PRODUCTS, Product } from "@/data/storeData";
import { useLiveProducts } from "@/lib/useLiveProducts";

const BEST_SELLER_TABS = [
  { key: "all", label: "Tous" },
  { key: "Montres", label: "Montres" },
  { key: "Coffrets Cadeaux", label: "Coffrets Cadeaux" },
  { key: "Lunettes", label: "Lunettes" },
  { key: "Maroquinerie & Sacs", label: "Maroquinerie" },
  { key: "Parfumerie", label: "Parfumerie" },
  { key: "Vêtements", label: "Vêtements" },
  { key: "Décorations", label: "Décorations" },
  { key: "Accessoires", label: "Accessoires" },
];

export default function HomePage() {
  const router = useRouter();
  const { products: liveProducts } = useLiveProducts();

  // Best Sellers Filter State (Default: all / Global)
  const [selectedBestSellerCategory, setSelectedBestSellerCategory] = useState<string>("all");

  // Deduplicate products by id to eliminate any duplicate key errors
  const uniqueProducts = Array.from(
    new Map((liveProducts.length > 0 ? liveProducts : FEATURED_PRODUCTS).map((p) => [p.id, p])).values()
  );

  // Ranked Best Sellers dynamically driven by real sales volume (Units Sold from site orders + POS)
  const allBestsellers = uniqueProducts.sort((a, b) => {
    const salesA = typeof a.salesCount === "number" ? a.salesCount : (a.reviewsCount || 0) * 2 + (a.rating || 5);
    const salesB = typeof b.salesCount === "number" ? b.salesCount : (b.reviewsCount || 0) * 2 + (b.rating || 5);
    return salesB - salesA;
  });

  const displayedBestsellers =
    selectedBestSellerCategory === "all"
      ? allBestsellers.slice(0, 15) // Top 15 Overall by default
      : allBestsellers
          .filter((p) => {
            const cat = (p.category || "").toLowerCase();
            const target = selectedBestSellerCategory.toLowerCase();
            return cat.includes(target) || target.includes(cat);
          })
          .slice(0, 10); // Top 10 for specific category

  // Drawers & Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductForCOD, setSelectedProductForCOD] = useState<Product | null>(null);

  // Cart (empty by default)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Single Active Department Accordion (closes previous when another is clicked)
  const [activeDept, setActiveDept] = useState<string | null>("dept-montres");

  const toggleDeptCard = (deptId: string) => {
    setActiveDept((prev) => {
      const next = prev === deptId ? null : deptId;
      if (next) {
        setTimeout(() => {
          const el = document.getElementById(next);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }, 100);
      }
      return next;
    });
  };

  // Sticky Cart Info
  const [stickyItem, setStickyItem] = useState({
    title: "COFFRET ROYAL BLACK",
    price: "5,800 DZD",
    productId: "prod-1",
  });

  const updateStickyCart = (title: string, price: string, productId: string) => {
    setStickyItem({ title, price, productId });
  };

  const handleOpenCODForProduct = (prod: Product) => {
    setSelectedProductForCOD(prod);
  };

  const handleAddToCart = (product: Product) => {
    if ((product.stockQuantity ?? 1) <= 0) return;
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
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans selection:bg-primary selection:text-[#FFFFFF]">
      {/* 1. Top Announcement Bar (Stitch Replica) */}
      <div className="bg-primary text-[#FFFFFF] py-1.5 px-4 flex items-center justify-center border-b border-primary/20">
        <span className="font-label-badge text-label-badge uppercase tracking-widest text-center text-[10px] font-bold">
          LIVRAISON 58 WILAYAS
        </span>
      </div>

      {/* 2. Main Luxury Header (Solid Opaque White for Perfect Scroll Contrast) */}
      <header className="sticky top-0 inset-x-0 z-40 bg-[#FFFFFF] border-b border-[#E5E7EB] shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all">
        <div className="h-16 px-4 flex items-center justify-between max-w-7xl mx-auto w-full">
          {/* Left: Search Trigger */}
          <div className="flex items-center justify-start">
            <button
              aria-label="Recherche"
              className="w-10 h-10 -ml-1 flex items-center justify-center text-[#0A0A0C] hover:text-[#C5A880] transition-colors focus:outline-none"
              type="button"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>

          {/* Center: Official Brand Logo */}
          <div className="flex flex-col items-center justify-center">
            <Link href="/" className="flex items-center justify-center group py-1">
              <img
                src="/images/hk-logo-light.png"
                alt="HK Store Chlef"
                className="h-10 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Right: Cart Trigger */}
          <div className="flex items-center justify-end">
            <button
              aria-label="Shopping Bag"
              className="w-10 h-10 -mr-1 flex items-center justify-center text-[#0A0A0C] hover:text-[#C5A880] relative focus:outline-none transition-colors"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#0A0A0C] text-[#FFFFFF] font-mono text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#FFFFFF] shadow-sm">
                {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto">
        {/* 3. Hero Showcase Section */}
        <section className="relative w-full overflow-hidden bg-[#0A0A0C] text-[#FFFFFF]">
          <div className="relative w-full h-[520px]">
            <img
              alt="HK Store Chlef Collection Exclusive - Montres, Parfums, Coffrets & Accessoires"
              className="w-full h-full object-cover object-center filter brightness-[0.92]"
              src="/images/hk-hero-banner.jpg"
            />
            
            {/* Architectural Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/35 to-transparent pointer-events-none"></div>
            
            {/* Scrim Overlay Content */}
            <div className="absolute inset-0 flex flex-col justify-end px-4 pb-6">
              {/* Conversion Action */}
              <div className="flex flex-col gap-2.5 w-full">
                <button
                  className="w-full h-13 py-3.5 px-6 bg-[#FFFFFF] hover:bg-[#0A0A0C] text-[#0A0A0C] hover:text-[#FFFFFF] border border-[#FFFFFF] hover:border-[#C5A880] font-heading font-extrabold text-xs sm:text-sm uppercase tracking-[0.22em] flex items-center justify-center transition-all duration-300 shadow-lg active:scale-[0.99] cursor-pointer"
                  onClick={() => {
                    const el = document.getElementById("univers-bento") || document.getElementById("catalog-bestsellers");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  type="button"
                >
                  <span>ACHETEZ MAINTENANT</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Univers HK Store Bento / 8 Stacked Department Cards (Smooth Accordion) */}
        <section className="w-full px-4 pt-8 pb-4" id="univers-bento">
          <div className="flex flex-col gap-3.5" id="departments-container">
            {DEPARTMENTS.map((dept) => {
              const isOpen = activeDept === dept.id;
              return (
                <div
                  key={dept.id}
                  className="border border-outline-variant/30 bg-surface-container-lowest overflow-hidden transition-all duration-300 shadow-sm"
                  id={dept.id}
                >
                  {/* Department Banner Header */}
                  <div
                    className="relative h-36 bg-primary cursor-pointer group"
                    onClick={() => toggleDeptCard(dept.id)}
                  >
                    <img
                      alt={`${dept.nameFr} HK Store`}
                      className="w-full h-full object-cover object-center filter brightness-[0.70] group-hover:scale-105 transition-transform duration-700"
                      src={dept.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent flex items-end justify-between p-3.5">
                      <div>
                        <h3 className="font-headline-md text-headline-md text-[#FFFFFF] font-bold uppercase text-sm sm:text-base tracking-wide">
                          {dept.nameFr} • {dept.nameAr}
                        </h3>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shrink-0">
                        <ChevronDown
                          className={`w-4 h-4 stroke-[2] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            isOpen ? "rotate-180 text-[#C5A880]" : "text-white"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Smooth Animated Subcategories Drawer */}
                  <div
                    className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-3 bg-surface-container-low border-t border-outline-variant/20">
                        <div className="grid grid-cols-2 gap-2.5">
                          {dept.subcategories.map((subcat, idx) => (
                            <Link
                              key={subcat.slug || idx}
                              href={`/collection/${dept.slug}?sub=${subcat.slug}`}
                              className={`p-3 bg-surface-container-lowest border border-outline-variant/25 hover:border-primary flex flex-col justify-between transition-all duration-300 active:scale-[0.98] group shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${
                                isOpen
                                  ? "translate-y-0 opacity-100"
                                  : "translate-y-2 opacity-0"
                              }`}
                              style={{
                                transitionDelay: isOpen ? `${idx * 40}ms` : "0ms",
                              }}
                            >
                              <div>
                                <span className="font-label-caps text-[11px] font-bold uppercase text-primary tracking-wide block">
                                  {subcat.nameFr}
                                </span>
                                <span className="font-body-sm text-[12px] text-on-surface-variant mt-1 block text-right dir-rtl font-arabic font-medium">
                                  {subcat.nameAr}
                                </span>
                              </div>
                              <div className="mt-2.5 pt-1.5 border-t border-outline-variant/15 flex items-center justify-between text-primary font-label-caps text-[9px] uppercase tracking-wider group-hover:text-secondary transition-colors">
                                <span>Explorer / تصفح</span>
                                <ArrowRight className="w-3 h-3 stroke-[2] transition-transform group-hover:translate-x-0.5" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. MEILLEURES VENTES / Best Sellers (Stitch Exact Replica + Dynamic Category Tabs) */}
        <section className="w-full px-4 pt-6 pb-2" id="catalog-bestsellers">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" />
                <span className="font-label-badge text-label-badge uppercase tracking-[0.2em] text-[#C5A880] font-bold text-[10px]">
                  PALMARÈS EXCLUSIF • الأكثر طلباً
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md uppercase font-bold text-on-surface tracking-tight mt-0.5 text-base sm:text-lg">
                MEILLEURES VENTES
              </h2>
            </div>
            <span className="text-[11px] text-[#71717A] font-medium hidden sm:block">
              {selectedBestSellerCategory === "all"
                ? "15 Meilleurs Modèles (Tout le Site)"
                : `Top 10 : ${selectedBestSellerCategory}`}
            </span>
          </div>

          {/* Category Filter Pills (Switchable Tabs - MCHII KAAML YBAANOO MEA BAED - YBDEL MA BINATHOM) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 pt-1">
            {BEST_SELLER_TABS.map((tab) => {
              const isActive = selectedBestSellerCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedBestSellerCategory(tab.key)}
                  className={`h-9 px-4 text-xs font-heading font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center justify-center cursor-pointer rounded-none border ${
                    isActive
                      ? "bg-[#0A0A0C] text-[#FFFFFF] border-[#0A0A0C] shadow-sm font-extrabold"
                      : "bg-[#FFFFFF] text-[#6B7280] border-[#E5E7EB] hover:border-[#0A0A0C] hover:text-[#0A0A0C]"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex overflow-x-auto gap-3.5 no-scrollbar pb-3 snap-x -mx-4 px-4">
            {displayedBestsellers.length === 0 ? (
              <div className="w-full py-12 text-center text-xs text-[#71717A] bg-surface-container-lowest border border-[#E5E7EB]">
                Aucun modèle disponible pour cette catégorie actuellement.
              </div>
            ) : (
              displayedBestsellers.map((prod, idx) => {
                const isOutOfStock = (prod.stockQuantity ?? 1) <= 0;

                return (
                  <div
                    key={`bs-${prod.id}-${idx}`}
                    className={`min-w-[260px] max-w-[260px] bg-surface-container-lowest border flex flex-col justify-between shrink-0 shadow-sm snap-start transition-all relative overflow-hidden ${
                      isOutOfStock ? "border-[#E5E7EB] opacity-90" : "border-outline-variant/30"
                    }`}
                  >
                    <Link
                      href={`/product/${prod.id}`}
                      className="relative w-full h-[240px] bg-surface-container overflow-hidden group block"
                    >
                      {/* Rank / Performance Medal Badge */}
                      <div className="absolute top-2 left-2 z-20">
                        {idx === 0 ? (
                          <span className="px-2.5 py-0.5 bg-[#C5A880] text-[#0A0A0C] font-heading font-black text-[9px] uppercase tracking-wider shadow-sm">
                            N°1 VENTE
                          </span>
                        ) : idx === 1 ? (
                          <span className="px-2.5 py-0.5 bg-[#E2E8F0] text-[#0A0A0C] font-heading font-black text-[9px] uppercase tracking-wider shadow-sm">
                            N°2 VENTE
                          </span>
                        ) : idx === 2 ? (
                          <span className="px-2.5 py-0.5 bg-[#F59E0B] text-[#FFFFFF] font-heading font-black text-[9px] uppercase tracking-wider shadow-sm">
                            N°3 VENTE
                          </span>
                        ) : prod.badge ? (
                          <span className="px-2 py-0.5 bg-[#0A0A0C]/80 text-[#FFFFFF] font-heading font-bold text-[9px] uppercase tracking-wider backdrop-blur-xs">
                            {prod.badge}
                          </span>
                        ) : null}
                      </div>

                      {/* Banner ÉPUISÉ / نفد من المخزون */}
                      {isOutOfStock && (
                        <div className="absolute top-0 inset-x-0 z-30 bg-[#DC2626] text-[#FFFFFF] py-2 px-3 shadow-lg flex items-center justify-between border-b-2 border-[#B91C1C]">
                          <span className="font-heading font-black text-[11px] tracking-widest uppercase flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            ÉPUISÉ
                          </span>
                          <span className="font-arabic font-extrabold text-[11px] dir-rtl">
                            نَفِدَ من المخزون
                          </span>
                        </div>
                      )}

                      <img
                        alt={prod.title}
                        style={isOutOfStock ? { filter: "grayscale(100%) contrast(75%)", opacity: 0.55 } : undefined}
                        className={`w-full h-full object-cover object-center transition-all duration-700 ${
                          isOutOfStock ? "grayscale contrast-75 opacity-50" : "group-hover:scale-105"
                        }`}
                        src={prod.image}
                      />
                    </Link>

                    <div className="p-3.5 flex flex-col flex-1 justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <span className="font-label-badge text-[9px] uppercase tracking-[0.2em] text-[#e0c298] font-bold">
                            {prod.category}
                          </span>
                          {isOutOfStock ? (
                            <span className="text-[9px] font-heading font-bold text-[#DC2626] uppercase tracking-wider">
                              0 en stock
                            </span>
                          ) : (prod.stockQuantity ?? 1) <= 3 ? (
                            <span className="text-[9px] font-heading font-bold text-[#F59E0B] uppercase tracking-wider">
                              Dernières pièces
                            </span>
                          ) : null}
                        </div>

                        <Link href={`/product/${prod.id}`}>
                          <h3
                            className={`font-headline-sm text-[12px] font-bold uppercase tracking-tight mt-1 leading-snug transition-colors line-clamp-2 ${
                              isOutOfStock ? "text-[#6B7280]" : "text-on-surface hover:text-secondary"
                            }`}
                          >
                            {prod.title}
                          </h3>
                        </Link>

                        <div className="flex items-baseline gap-2 mt-2">
                          <span
                            className={`font-headline-sm text-price-lg font-extrabold text-base ${
                              isOutOfStock ? "text-[#9CA3AF]" : "text-primary"
                            }`}
                          >
                            {prod.price.toLocaleString()} DZD
                          </span>
                          {prod.originalPrice && (
                            <span className="font-body-sm text-price-strike text-on-surface-variant line-through text-xs text-[#9CA3AF]">
                              {prod.originalPrice.toLocaleString()} DZD
                            </span>
                          )}
                        </div>
                      </div>

                      {isOutOfStock ? (
                        <button
                          type="button"
                          disabled
                          className="w-full mt-3.5 h-11 bg-[#F4F4F5] text-[#9CA3AF] border border-[#E4E4E7] font-heading font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed select-none opacity-80"
                        >
                          <Ban className="w-4 h-4 stroke-[2] text-[#DC2626]" />
                          <span className="text-[#6B7280]">RUPTURE DE STOCK • نَفِدَ</span>
                        </button>
                      ) : (
                        <button
                          className="w-full mt-3.5 h-11 bg-[#0A0A0C] hover:bg-[#C5A880] text-[#FFFFFF] hover:text-[#0A0A0C] font-heading font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                          onClick={() => {
                            handleAddToCart(prod);
                            updateStickyCart(prod.title, `${prod.price.toLocaleString()} DZD`, prod.id);
                          }}
                          type="button"
                        >
                          <ShoppingBag className="w-4 h-4 stroke-[1.5] text-current" />
                          <span className="text-[#FFFFFF] group-hover:text-inherit">AJOUTER AU PANIER</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* 6. Engagement Qualité - Pourquoi Choisir HK Store ? (Stitch Exact Replica) */}
        <section className="w-full px-4 py-6 bg-surface-container-low mt-4">
          <div className="mb-4">
            <span className="font-label-badge text-label-badge uppercase tracking-[0.2em] text-[#725b38] font-bold text-[10px]">
              ENGAGEMENT QUALITÉ
            </span>
            <h2 className="font-headline-md text-headline-md uppercase font-bold text-on-surface tracking-tight mt-0.5 text-base sm:text-lg">
              Pourquoi Choisir HK Store ?
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Pillar 1 */}
            <div className="p-4 bg-surface-container-lowest shadow-sm flex flex-col justify-start border border-outline-variant/20">
              <Truck className="w-6 h-6 text-primary mb-2 stroke-[1.5]" />
              <h4 className="font-headline-sm text-[12px] font-bold text-on-surface uppercase tracking-wide">
                Livraison 58 Wilayas
              </h4>
              <p className="font-body-sm text-[11px] text-on-surface-variant mt-1 leading-snug">
                Expédition sécurisée sous 24/48h via Yalidine &amp; ZR Express à domicile ou stop-desk.
              </p>
            </div>
            {/* Pillar 2 */}
            <div className="p-4 bg-surface-container-lowest shadow-sm flex flex-col justify-start border border-outline-variant/20">
              <ShieldCheck className="w-6 h-6 text-primary mb-2 stroke-[1.5]" />
              <h4 className="font-headline-sm text-[12px] font-bold text-on-surface uppercase tracking-wide">
                Inspection avant Paiement
              </h4>
              <p className="font-body-sm text-[11px] text-on-surface-variant mt-1 leading-snug">
                Ouvrez et examinez votre montre en main propre avant de régler le livreur.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer (Stitch Exact Replica) */}
      <footer className="w-full bg-[#0a0a0c] text-[#f9f9ff] px-5 pt-10 pb-8 mt-2 border-t border-[#293040]/50">
        <div className="flex flex-col gap-8 max-w-xl mx-auto">
          {/* Logo & Description */}
          <div className="flex flex-col items-center text-center">
            <span className="font-headline-md text-[18px] uppercase tracking-[0.25em] font-extrabold text-[#ffffff]">
              HK STORE
            </span>
            <span className="font-label-caps text-[10px] uppercase tracking-[0.35em] text-[#e0c298] mt-1 font-bold">
              CHLEF
            </span>
            <p className="font-body-sm text-[12px] text-[#c8c5ca] mt-3 leading-relaxed max-w-[320px]">
              Maison d'Horlogerie, Parfumerie &amp; Maroquinerie d'Exception — Chlef, Algérie.
            </p>
          </div>

          {/* Boutique Physique & Showroom Box */}
          <div className="p-4 border border-[#78767b]/20 bg-[#141b2b]/40 rounded-none">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#e0c298] shrink-0 mt-0.5 stroke-[1.5]" />
              <div className="flex flex-col">
                <span className="font-label-caps text-[10px] uppercase tracking-wider text-[#e0c298] font-bold">
                  Boutique Physique &amp; Showroom
                </span>
                <p className="font-body-sm text-[12px] text-[#f9f9ff] mt-1 leading-snug">
                  Centre-Ville, Boulevard Mokdad, Chlef, 02000, Algérie
                </p>
                <p className="font-body-sm text-[11px] text-[#c8c5ca] mt-0.5">
                  Ouvert 7j/7 • 09:00 - 20:30
                </p>
              </div>
            </div>
            <a
              className="mt-3.5 w-full py-2.5 px-3 border border-[#c8c5ca]/30 hover:border-[#ffffff] bg-transparent text-[#ffffff] font-label-caps text-[10px] uppercase font-bold tracking-[0.14em] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              href="https://maps.app.goo.gl/hueVRXbrsJ4i39Du9?g_st=it"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Compass className="w-4 h-4 text-[#e0c298] stroke-[1.5]" />
              <span>VOIR NOTRE BOUTIQUE SUR GOOGLE MAPS</span>
            </a>
          </div>

          {/* Canaux Officiels & Contact Direct */}
          <div className="flex flex-col gap-2.5">
            <span className="font-label-caps text-[10px] uppercase tracking-[0.2em] text-[#e0c298] font-bold text-center">
              CANAUX OFFICIELS &amp; CONTACT DIRECT
            </span>
            <div className="grid grid-cols-1 gap-2">
              <a
                className="flex items-center justify-between p-3 border border-[#78767b]/25 bg-[#1c1b1d]/70 text-[#f9f9ff] hover:border-[#25D366] transition-colors cursor-pointer"
                href="https://wa.me/213792746456?text=Bonjour%20HK%20Store%20Chlef"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#25D366] stroke-[1.5]" />
                  <div className="flex flex-col text-left">
                    <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-[#ffffff]">
                      WhatsApp &amp; Téléphone
                    </span>
                    <span className="font-mono text-[10px] text-[#c8c5ca]">0792 74 64 56</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#c8c5ca]" />
              </a>

              <div className="grid grid-cols-2 gap-2">
                <a
                  className="flex items-center justify-center gap-2 p-2.5 border border-[#78767b]/25 bg-[#1c1b1d]/70 text-[#f9f9ff] hover:border-[#E1306C] hover:text-[#E1306C] transition-colors text-center cursor-pointer"
                  href="https://www.instagram.com/hkstore_chlef?stkn=MXcxbWdkazV1bHk4ZA=="
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="font-label-caps text-[10px] font-bold uppercase tracking-wider">
                    Instagram • @hkstore_chlef
                  </span>
                </a>
                <a
                  className="flex items-center justify-center gap-2 p-2.5 border border-[#78767b]/25 bg-[#1c1b1d]/70 text-[#f9f9ff] hover:border-[#1877F2] hover:text-[#1877F2] transition-colors text-center cursor-pointer"
                  href="https://www.facebook.com/share/1E8jBtYmH4/?mibextid=wwXIfr"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="font-label-caps text-[10px] font-bold uppercase tracking-wider">
                    Facebook Officiel
                  </span>
                </a>
              </div>

              <a
                className="flex items-center justify-center gap-2 p-2.5 border border-[#78767b]/25 bg-[#1c1b1d]/70 text-[#f9f9ff] hover:border-[#00f2fe] hover:text-[#00f2fe] transition-colors w-full text-center cursor-pointer"
                href="https://www.tiktok.com/@hk.store.02?_r=1&_t=ZS-9A3Zof1NXU7"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="font-label-caps text-[10px] font-bold uppercase tracking-wider">
                  TikTok • @hk.store.02
                </span>
              </a>
            </div>
          </div>

          {/* Verification Badges */}
          <div className="flex flex-col items-center text-center gap-3 pt-2">
            <div className="flex items-center justify-center gap-4 py-2 border-b border-[#78767b]/20 w-full">
              <div className="flex items-center gap-1.5 text-[10px] font-label-caps tracking-wider text-[#c8c5ca]">
                <Lock className="w-4 h-4 text-[#e0c298] stroke-[1.5]" />
                <span>PAIEMENT COD VÉRIFIÉ</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-label-caps tracking-wider text-[#c8c5ca]">
                <CheckCircle className="w-4 h-4 text-[#e0c298] stroke-[1.5]" />
                <span>INSPECTION AVANT PAIEMENT</span>
              </div>
            </div>
            <span className="font-label-badge text-[9px] uppercase tracking-[0.18em] text-[#78767b]">
              © 2025 HK STORE CHLEF. TOUS DROITS RÉSERVÉS.
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
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

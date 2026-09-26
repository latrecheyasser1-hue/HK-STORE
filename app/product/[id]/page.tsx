"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ShieldCheck,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  Share2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import MegaNavDrawer from "@/components/MegaNavDrawer";
import CartDrawer, { CartItem } from "@/components/CartDrawer";
import { FEATURED_PRODUCTS, WILAYAS_DZ, Product } from "@/data/storeData";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const productId = resolvedParams.id;

  const product = FEATURED_PRODUCTS.find((p) => p.id === productId) || FEATURED_PRODUCTS[0];

  // UI States
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0]?.options[0] || "Standard"
  );
  const [quantity, setQuantity] = useState(1);
  const [deliveryType, setDeliveryType] = useState<"domicile" | "stopdesk">("domicile");
  const [selectedWilayaCode, setSelectedWilayaCode] = useState(2); // Chlef by default

  // Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [commune, setCommune] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Global drawers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Shipping calculation
  const currentWilaya =
    WILAYAS_DZ.find((w) => w.code === Number(selectedWilayaCode)) ||
    WILAYAS_DZ[1]; // default Chlef

  const shippingCost =
    deliveryType === "domicile"
      ? currentWilaya.domicilePrice
      : currentWilaya.stopdeskPrice;

  const totalAmount = product.price * quantity + shippingCost;

  const handleAddToCart = () => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          variant: selectedVariant,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleDirectCODOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert("Veuillez remplir votre nom et numéro de téléphone.");
      return;
    }

    if (!/^(05|06|07)[0-9]{8}$/.test(phone.replace(/\s+/g, ""))) {
      alert("Veuillez saisir un numéro de téléphone algérien valide (ex: 0550123456)");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const generatedOrder = `HK-${Date.now().toString().slice(-6)}`;
      setOrderNumber(generatedOrder);
      setOrderSuccess(true);
    }, 1000);
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
        {/* Breadcrumb Bar */}
        <div className="bg-[#F7F7F8] border-b border-[#E5E7EB] py-3 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#6B7280]">
              <Link href="/" className="hover:text-[#0A0A0C] transition-colors flex items-center gap-1 font-heading uppercase tracking-wider">
                <ChevronLeft className="w-3.5 h-3.5" />
                Accueil
              </Link>
              <span>/</span>
              <span className="font-heading uppercase tracking-wider text-[#C5A880]">{product.category}</span>
              <span className="hidden sm:inline">/</span>
              <span className="hidden sm:inline font-heading uppercase text-[#0A0A0C] font-semibold truncate max-w-[240px]">
                {product.title}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-heading font-bold text-[#0A0A0C] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Prêt pour expédition immédiate</span>
            </div>
          </div>
        </div>

        {/* Product Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
            
            {/* Left Column: Visual Gallery */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="relative aspect-[4/5] bg-[#F7F7F8] border border-[#E5E7EB] overflow-hidden group">
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Thumbnails */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedImage(product.image)}
                  className={`w-20 h-24 border ${
                    selectedImage === product.image
                      ? "border-[#0A0A0C] ring-2 ring-[#0A0A0C]/20"
                      : "border-[#E5E7EB] hover:border-[#6B7280]"
                  } overflow-hidden bg-[#F7F7F8] transition-all`}
                >
                  <img
                    src={product.image}
                    alt="Vue Principale"
                    className="w-full h-full object-cover"
                  />
                </button>

                {product.hoverImage && (
                  <button
                    onClick={() => setSelectedImage(product.hoverImage!)}
                    className={`w-20 h-24 border ${
                      selectedImage === product.hoverImage
                        ? "border-[#0A0A0C] ring-2 ring-[#0A0A0C]/20"
                        : "border-[#E5E7EB] hover:border-[#6B7280]"
                    } overflow-hidden bg-[#F7F7F8] transition-all`}
                  >
                    <img
                      src={product.hoverImage}
                      alt="Vue Angle"
                      className="w-full h-full object-cover"
                    />
                  </button>
                )}
              </div>

              {/* Reassurance Banner under Gallery */}
              <div className="mt-3.5 p-3.5 bg-[#F7F7F8] border border-[#E5E7EB] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-heading font-bold text-[11px] uppercase tracking-wider text-[#0A0A0C]">
                    Garantie d'Inspection en Main Propre (معاينة قبل الدفع)
                  </h4>
                  <p className="text-[11px] text-[#6B7280] mt-1 leading-relaxed">
                    Chez HK STORE Chlef, vous ne payez rien à l'avance. À l'arrivée du livreur Yalidine, vous ouvrez le colis, vérifiez la montre et ses finitions, puis vous réglez en toute confiance.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Information & 1-Click COD Checkout */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              
              {/* Category & Badge */}
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs uppercase font-extrabold tracking-[0.2em] text-[#C5A880]">
                  {product.category}
                </span>
                <span className="text-[11px] font-heading uppercase tracking-wider text-[#6B7280]">
                  Réf: {product.id.toUpperCase()}
                </span>
              </div>

              {/* Main Title */}
              <h1 className="font-heading font-extrabold text-base sm:text-lg lg:text-xl text-[#0A0A0C] uppercase tracking-normal mt-1.5 leading-snug">
                {product.title}
              </h1>

              {/* Arabic Subtitle */}
              <p className="font-arabic text-xs text-[#6B7280] mt-1 dir-rtl">
                {product.subtitleArabic}
              </p>

              {/* Pricing Display */}
              <div className="py-3 border-b border-[#E5E7EB]">
                <div className="flex items-baseline gap-3">
                  <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#0A0A0C] tracking-tight">
                    {product.price.toLocaleString()} DZD
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-[#9CA3AF] line-through font-sans">
                      {product.originalPrice.toLocaleString()} DZD
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="px-2 py-0.5 bg-[#DC2626] text-[#FFFFFF] font-heading font-bold text-[9px] uppercase tracking-wider">
                      Économisez {(product.originalPrice - product.price).toLocaleString()} DZD
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selector & Cart Action */}
              <div className="py-4 border-b border-[#E5E7EB] flex items-center gap-4">
                <div className="flex items-center border border-[#E5E7EB] h-11 bg-[#F7F7F8]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-full flex items-center justify-center font-bold text-sm hover:bg-[#E5E7EB] transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-sm">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    className="w-10 h-full flex items-center justify-center font-bold text-sm hover:bg-[#E5E7EB] transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 h-11 bg-[#FFFFFF] hover:bg-[#0A0A0C] text-[#0A0A0C] hover:text-[#FFFFFF] border-2 border-[#0A0A0C] font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                  <span>Ajouter au Panier</span>
                </button>
              </div>

              {/* 1-Click Fast COD Form Box */}
              <div className="mt-6 p-5 sm:p-6 bg-[#FAFAFA] border-2 border-[#0A0A0C] shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                  <div>
                    <h3 className="font-heading font-black text-sm uppercase tracking-wider text-[#0A0A0C] flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#C5A880]" />
                      Commander Immédiatement (Paiement COD)
                    </h3>
                    <p className="font-arabic text-xs text-[#6B7280] mt-0.5 dir-rtl">
                      أدخل معلوماتك للتأكيد الفوري والدفع عند الاستلام
                    </p>
                  </div>
                </div>

                {orderSuccess ? (
                  <div className="py-6 text-center">
                    <div className="w-12 h-12 bg-[#10B981]/10 text-[#10B981] mx-auto flex items-center justify-center mb-3">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h4 className="font-heading font-extrabold text-base uppercase text-[#0A0A0C]">
                      Commande Enregistrée avec Succès !
                    </h4>
                    <p className="font-mono text-xs font-bold text-[#C5A880] mt-1">
                      Numéro de commande : {orderNumber}
                    </p>
                    <p className="text-xs text-[#4B5563] mt-2">
                      Notre service client basé à Chlef va vous appeler sur le <strong className="text-[#0A0A0C]">{phone}</strong> dans les 2 prochaines heures pour validation de l'expédition Yalidine.
                    </p>
                    <button
                      type="button"
                      onClick={() => setOrderSuccess(false)}
                      className="mt-4 px-5 py-2 bg-[#0A0A0C] text-[#FFFFFF] font-heading text-xs uppercase tracking-wider font-bold"
                    >
                      Commander un autre article
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleDirectCODOrder} className="mt-4 space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-[#0A0A0C] mb-1">
                        Nom et Prénom * (الاسم واللقب)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Mohamed Benali"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D1D5DB] focus:border-[#0A0A0C] focus:outline-none text-xs font-sans placeholder:text-[#9CA3AF]"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-[#0A0A0C] mb-1">
                        Numéro de Téléphone * (رقم الهاتف)
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="05 / 06 / 07 XX XX XX XX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D1D5DB] focus:border-[#0A0A0C] focus:outline-none text-xs font-mono placeholder:text-[#9CA3AF]"
                      />
                    </div>

                    {/* Wilaya Selection (58 Wilayas) */}
                    <div>
                      <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-[#0A0A0C] mb-1">
                        Wilaya de Destination * (الولاية)
                      </label>
                      <select
                        value={selectedWilayaCode}
                        onChange={(e) => setSelectedWilayaCode(Number(e.target.value))}
                        className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D1D5DB] focus:border-[#0A0A0C] focus:outline-none text-xs font-heading font-semibold"
                      >
                        {WILAYAS_DZ.map((w) => (
                          <option key={w.code} value={w.code}>
                            {String(w.code).padStart(2, "0")} - {w.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Delivery Mode Toggle */}
                    <div>
                      <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-[#0A0A0C] mb-1.5">
                        Mode de Livraison Yalidine *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDeliveryType("domicile")}
                          className={`p-2.5 text-left border text-xs transition-all ${
                            deliveryType === "domicile"
                              ? "bg-[#0A0A0C] text-[#FFFFFF] border-[#0A0A0C]"
                              : "bg-[#FFFFFF] text-[#4B5563] border-[#D1D5DB] hover:border-[#0A0A0C]"
                          }`}
                        >
                          <div className="font-heading font-bold uppercase text-[10px]">À Domicile</div>
                          <div className="font-mono font-semibold mt-0.5">
                            {currentWilaya.domicilePrice} DZD
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeliveryType("stopdesk")}
                          className={`p-2.5 text-left border text-xs transition-all ${
                            deliveryType === "stopdesk"
                              ? "bg-[#0A0A0C] text-[#FFFFFF] border-[#0A0A0C]"
                              : "bg-[#FFFFFF] text-[#4B5563] border-[#D1D5DB] hover:border-[#0A0A0C]"
                          }`}
                        >
                          <div className="font-heading font-bold uppercase text-[10px]">Bureau Yalidine</div>
                          <div className="font-mono font-semibold mt-0.5">
                            {currentWilaya.stopdeskPrice} DZD
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Commune / Address */}
                    <div>
                      <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-[#0A0A0C] mb-1">
                        Commune ou Adresse exacte (البلدية أو العنوان)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Chlef Centre / Hay Salam"
                        value={commune}
                        onChange={(e) => setCommune(e.target.value)}
                        className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D1D5DB] focus:border-[#0A0A0C] focus:outline-none text-xs font-sans placeholder:text-[#9CA3AF]"
                      />
                    </div>

                    {/* Cost Summary */}
                    <div className="p-3 bg-[#FFFFFF] border border-[#E5E7EB] space-y-1.5 text-xs">
                      <div className="flex justify-between text-[#6B7280]">
                        <span>Sous-total ({quantity} article{quantity > 1 ? "s" : ""}) :</span>
                        <span className="font-mono">{(product.price * quantity).toLocaleString()} DZD</span>
                      </div>
                      <div className="flex justify-between text-[#6B7280]">
                        <span>Livraison Yalidine ({currentWilaya.name}) :</span>
                        <span className="font-mono">{shippingCost.toLocaleString()} DZD</span>
                      </div>
                      <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-baseline font-heading font-extrabold text-sm text-[#0A0A0C]">
                        <span>TOTAL À PAYER À LA LIVRAISON :</span>
                        <span className="text-base text-[#0A0A0C] font-mono">
                          {totalAmount.toLocaleString()} DZD
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full h-14 px-6 rounded-lg bg-[#0A0A0C] hover:bg-[#18191E] border border-[#27272A] hover:border-[#C5A880] text-[#FFFFFF] font-heading font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-200 shadow-xl hover:shadow-[#C5A880]/15 active:scale-[0.99] disabled:opacity-50 cursor-pointer overflow-hidden"
                    >
                      <ShieldCheck className="w-5 h-5 text-[#C5A880] transition-transform duration-200 group-hover:scale-110" />
                      <span>{isSubmitting ? "Envoi en cours..." : "CONFIRMER MA COMMANDE • الدفع عند الاستلام"}</span>
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>

          {/* Description */}
          <div className="mt-16 pt-12 border-t border-[#E5E7EB] max-w-3xl">
            <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-[#0A0A0C]">
              Description du Produit
            </h2>
            <p className="text-sm text-[#4B5563] leading-relaxed mt-4 font-sans">
              {product.description}
            </p>
            <p className="text-sm text-[#4B5563] leading-relaxed mt-3 font-sans">
              Chaque pièce de la collection HK STORE est minutieusement vérifiée dans notre atelier à Chlef avant d'être expédiée. Conçue avec des matériaux nobles, elle incarne la précision et l'élégance contemporaine.
            </p>

            {/* Reassurance Mini Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="p-4 border border-[#E5E7EB] bg-[#F7F7F8]">
                <Clock className="w-5 h-5 text-[#C5A880] mb-2" />
                <h4 className="font-heading font-bold text-xs uppercase text-[#0A0A0C]">Livraison 24H / 48H</h4>
                <p className="text-[11px] text-[#6B7280] mt-1">Expédition rapide et sécurisée vers les 58 Wilayas via Yalidine.</p>
              </div>
              <div className="p-4 border border-[#E5E7EB] bg-[#F7F7F8]">
                <RotateCcw className="w-5 h-5 text-[#C5A880] mb-2" />
                <h4 className="font-heading font-bold text-xs uppercase text-[#0A0A0C]">Retour Garanti</h4>
                <p className="text-[11px] text-[#6B7280] mt-1">Échange immédiat en cas de non-conformité.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Sticky Mobile Buy Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0A0A0C] text-[#FFFFFF] p-3 border-t border-[#27272A] flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex flex-col">
          <span className="font-heading font-bold text-[10px] uppercase text-[#C5A880] truncate max-w-[150px]">
            {product.title}
          </span>
          <span className="font-heading font-extrabold text-sm text-[#FFFFFF]">
            {(product.price * quantity).toLocaleString()} DZD
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            const formEl = document.querySelector("form");
            formEl?.scrollIntoView({ behavior: "smooth" });
          }}
          className="h-10 px-5 bg-[#FFFFFF] hover:bg-[#C5A880] text-[#0A0A0C] font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
        >
          <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
          <span>COMMANDER (COD)</span>
        </button>
      </div>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
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
          const formEl = document.querySelector("form");
          formEl?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, Truck, ShieldCheck, MapPin, Phone, User, Package } from "lucide-react";
import { Product, WILAYAS_DZ } from "@/data/storeData";

interface QuickCODModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess?: () => void;
}

export default function QuickCODModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: QuickCODModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedWilayaCode, setSelectedWilayaCode] = useState<number>(2); // Default Chlef (02)
  const [commune, setCommune] = useState("");
  const [deliveryType, setDeliveryType] = useState<"domicile" | "stopdesk">("domicile");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0].options[0]);
    }
    setOrderSuccess(false);
    setConfirmedOrder(null);
    setErrorMessage("");
  }, [product]);

  if (!isOpen || !product) return null;

  const currentWilaya = WILAYAS_DZ.find((w) => w.code === selectedWilayaCode) || WILAYAS_DZ[1];
  const shippingCost = deliveryType === "domicile" ? currentWilaya.domicilePrice : currentWilaya.stopdeskPrice;
  const subtotal = product.price * quantity;
  const grandTotal = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage("Veuillez remplir votre nom et numéro de téléphone.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: fullName.trim(),
          customer_phone: phone.trim(),
          wilaya_code: currentWilaya.code,
          wilaya_name: currentWilaya.name,
          commune_name: commune.trim() || "Centre",
          delivery_type: deliveryType,
          items: [
            {
              product_id: product.id.startsWith("prod-") ? undefined : product.id,
              product_title: product.title,
              quantity: quantity,
              unit_price: product.price,
              selected_variant: selectedVariant || null,
            },
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la validation de commande.");
      }

      setConfirmedOrder(data.order);
      setOrderSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setErrorMessage(err.message || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end transition-opacity duration-300">
      <div className="relative w-full max-w-lg h-full bg-[#FFFFFF] flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="h-16 px-5 bg-[#0A0A0C] text-[#FFFFFF] flex items-center justify-between shrink-0 border-b border-[#27272A]">
          <div className="flex flex-col">
            <span className="font-heading text-xs uppercase tracking-[0.25em] font-extrabold text-[#FFFFFF]">
              COMMANDE EXPRESS SANS COMPTE
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#C5A880] font-arabic">
              طلب سريع — الدفع نقداً عند الاستلام بعد المعاينة
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#C5A880] transition-colors"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {orderSuccess ? (
          /* Success Screen */
          <div className="p-8 flex flex-col items-center justify-center flex-1 text-center">
            <div className="w-16 h-16 bg-[#0A0A0C] text-[#C5A880] rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="font-heading text-xl font-extrabold text-[#0A0A0C] uppercase tracking-wide">
              COMMANDE CONFIRMÉE !
            </h3>
            {confirmedOrder?.order_number && (
              <span className="inline-block mt-1 px-3 py-1 bg-[#0A0A0C] text-[#C5A880] text-xs font-mono font-bold tracking-widest">
                N° {confirmedOrder.order_number}
              </span>
            )}
            <p className="font-arabic font-bold text-base text-[#C5A880] mt-2">
              تم تسجيل طلبك بنجاح وسنتصل بك لتأكيده
            </p>
            <p className="text-xs text-[#6B7280] mt-3 max-w-xs leading-relaxed">
              Notre équipe vous contactera au <strong className="text-[#0A0A0C] font-mono">{phone}</strong> pour confirmer l&apos;adresse avant expédition avec Yalidine.
            </p>

            <div className="w-full mt-6 p-4 bg-[#F7F7F8] border border-[#E5E7EB] text-left text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Numéro :</span>
                <span className="font-bold text-[#C5A880]">{confirmedOrder?.order_number || "HK-CONFIRM"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Article :</span>
                <span className="font-bold text-[#0A0A0C]">{product.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Destination :</span>
                <span className="font-bold text-[#0A0A0C]">{currentWilaya.code} - {currentWilaya.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Montant à payer :</span>
                <span className="font-bold text-[#0A0A0C]">{(confirmedOrder?.total_amount || grandTotal).toLocaleString()} DZD</span>
              </div>
              {confirmedOrder?.yalidine_tracking_code && (
                <div className="flex justify-between py-1">
                  <span className="text-[#6B7280]">Suivi Yalidine :</span>
                  <span className="font-bold text-[#10B981]">{confirmedOrder.yalidine_tracking_code}</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="mt-8 w-full h-12 bg-[#0A0A0C] text-[#FFFFFF] font-heading text-xs uppercase font-bold tracking-wider hover:bg-[#C5A880] transition-colors"
            >
              RETOURNER À LA BOUTIQUE
            </button>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-5 flex-1 flex flex-col justify-between">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}
            <div className="space-y-5">
              {/* Product Mini Banner */}
              <div className="p-3 bg-[#F7F7F8] border border-[#E5E7EB] flex items-center gap-3">
                <div className="w-14 h-14 bg-[#FFFFFF] shrink-0 border border-[#E5E7EB] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading text-xs font-bold text-[#0A0A0C] uppercase truncate">
                    {product.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-heading font-extrabold text-sm text-[#0A0A0C]">
                      {product.price.toLocaleString()} DZD
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-[#9CA3AF] line-through font-sans">
                        {product.originalPrice.toLocaleString()} DZD
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3.5">
                <div>
                  <label className="block font-heading text-[10px] font-bold uppercase tracking-wider text-[#111827] mb-1">
                    Nom & Prénom / الاسم واللقب <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3.5 stroke-[1.5]" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Karim Boukhalfa"
                      className="w-full h-11 pl-9 pr-3 border border-[#E5E7EB] focus:border-[#0A0A0C] text-sm text-[#111827] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-heading text-[10px] font-bold uppercase tracking-wider text-[#111827] mb-1">
                    Numéro de Téléphone / رقم الهاتف <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3.5 stroke-[1.5]" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05 / 06 / 07 XX XX XX"
                      className="w-full h-11 pl-9 pr-3 border border-[#E5E7EB] focus:border-[#0A0A0C] text-sm text-[#111827] font-mono focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-heading text-[10px] font-bold uppercase tracking-wider text-[#111827] mb-1">
                      Wilaya / الولاية <span className="text-[#DC2626]">*</span>
                    </label>
                    <select
                      value={selectedWilayaCode}
                      onChange={(e) => setSelectedWilayaCode(Number(e.target.value))}
                      className="w-full h-11 px-3 border border-[#E5E7EB] focus:border-[#0A0A0C] text-xs text-[#111827] bg-[#FFFFFF] focus:outline-none transition-colors"
                    >
                      {WILAYAS_DZ.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.code} - {w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-heading text-[10px] font-bold uppercase tracking-wider text-[#111827] mb-1">
                      Commune / البلدية <span className="text-[#DC2626]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3.5 stroke-[1.5]" />
                      <input
                        type="text"
                        required
                        value={commune}
                        onChange={(e) => setCommune(e.target.value)}
                        placeholder="Ex: Chlef Centre"
                        className="w-full h-11 pl-9 pr-3 border border-[#E5E7EB] focus:border-[#0A0A0C] text-xs text-[#111827] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Mode Radios */}
                <div>
                  <label className="block font-heading text-[10px] font-bold uppercase tracking-wider text-[#111827] mb-2">
                    Mode de Livraison Yalidine :
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("domicile")}
                      className={`p-3 border text-left flex flex-col justify-between transition-colors ${
                        deliveryType === "domicile"
                          ? "border-[#0A0A0C] bg-[#F7F7F8]"
                          : "border-[#E5E7EB] bg-[#FFFFFF]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-[11px] font-bold text-[#0A0A0C]">
                          À Domicile
                        </span>
                        <span className="font-mono text-xs font-bold text-[#0A0A0C]">
                          +{currentWilaya.domicilePrice} DZD
                        </span>
                      </div>
                      <span className="text-[10px] text-[#6B7280] mt-1">
                        Livré chez vous sous 24-48h
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType("stopdesk")}
                      className={`p-3 border text-left flex flex-col justify-between transition-colors ${
                        deliveryType === "stopdesk"
                          ? "border-[#0A0A0C] bg-[#F7F7F8]"
                          : "border-[#E5E7EB] bg-[#FFFFFF]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-[11px] font-bold text-[#0A0A0C]">
                          Point Relais
                        </span>
                        <span className="font-mono text-xs font-bold text-[#0A0A0C]">
                          +{currentWilaya.stopdeskPrice} DZD
                        </span>
                      </div>
                      <span className="text-[10px] text-[#6B7280] mt-1">
                        Bureau Yalidine de votre ville
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary & Submit CTA */}
            <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
              <div className="space-y-1.5 text-xs mb-4">
                <div className="flex justify-between text-[#6B7280]">
                  <span>Sous-total :</span>
                  <span className="font-mono">{subtotal.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Livraison ({currentWilaya.name} - {deliveryType === "domicile" ? "Domicile" : "Stopdesk"}) :</span>
                  <span className="font-mono">+{shippingCost.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#0A0A0C] pt-2 border-t border-[#E5E7EB]">
                  <span>Total Net à Payer (COD) :</span>
                  <span className="font-mono text-base text-[#0A0A0C]">
                    {grandTotal.toLocaleString()} DZD
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-13 bg-[#0A0A0C] hover:bg-[#C5A880] text-[#FFFFFF] hover:text-[#0A0A0C] font-heading font-bold text-xs uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>ENREGISTREMENT DU COLIS...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
                    <span>CONFIRMER MA COMMANDE • {grandTotal.toLocaleString()} DZD</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-[#6B7280] text-center mt-2.5">
                Vérifiez votre colis avant de payer le livreur • Garantie 100%
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

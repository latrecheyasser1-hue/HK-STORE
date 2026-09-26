"use client";

import React from "react";
import { X, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Plus, Minus } from "lucide-react";
import { Product } from "@/data/storeData";

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end transition-opacity duration-300">
      <div className="relative w-full max-w-md h-full bg-[#FFFFFF] flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="h-16 px-5 bg-[#0A0A0C] text-[#FFFFFF] flex items-center justify-between shrink-0 border-b border-[#27272A]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#C5A880] stroke-[1.5]" />
            <span className="font-heading text-xs uppercase tracking-[0.2em] font-extrabold text-[#FFFFFF]">
              VOTRE PANIER ({items.length})
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer panier"
            className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#C5A880] transition-colors"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="p-3 bg-[#F7F7F8] border-b border-[#E5E7EB] text-center">
          <span className="font-heading text-[10px] uppercase font-bold text-[#0A0A0C] tracking-wider">
            LIVRAISON 58 WILAYAS AVEC YALIDINE EXPRESS
          </span>
          <p className="text-[10px] text-[#6B7280] font-arabic mt-0.5">
            الدفع نقداً عند استلام ومعاينة الطلب
          </p>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center text-[#6B7280]">
              <ShoppingBag className="w-12 h-12 stroke-[1] text-[#9CA3AF] mb-3" />
              <p className="font-heading text-xs uppercase tracking-wider font-bold text-[#0A0A0C]">
                Votre panier est vide
              </p>
              <p className="text-xs text-[#6B7280] mt-1 font-arabic">
                سلتك فارغة حالياً، استكشف مجموعاتنا المميزة
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="p-3 bg-[#FFFFFF] border border-[#E5E7EB] flex gap-3 relative group"
              >
                <div className="w-16 h-20 bg-[#F7F7F8] shrink-0 overflow-hidden border border-[#E5E7EB]">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h4 className="font-heading text-xs font-bold text-[#0A0A0C] uppercase truncate">
                      {item.product.title}
                    </h4>
                    {item.variant && (
                      <span className="text-[10px] text-[#6B7280] uppercase">
                        Option: {item.variant}
                      </span>
                    )}
                    <span className="block font-heading font-extrabold text-xs text-[#0A0A0C] mt-1">
                      {item.product.price.toLocaleString()} DZD
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F3F4F6]">
                    <div className="flex items-center border border-[#E5E7EB]">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-[#F3F4F6] text-[#0A0A0C]"
                      >
                        <Minus className="w-3 h-3 stroke-[1.5]" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-[#F3F4F6] text-[#0A0A0C]"
                      >
                        <Plus className="w-3 h-3 stroke-[1.5]" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-[#9CA3AF] hover:text-[#DC2626] transition-colors p-1"
                      aria-label="Supprimer l'article"
                    >
                      <Trash2 className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-4 bg-[#FFFFFF] border-t border-[#E5E7EB] shrink-0">
            <div className="space-y-1.5 text-xs mb-4">
              <div className="flex justify-between text-[#6B7280]">
                <span>Sous-total articles :</span>
                <span className="font-mono text-[#0A0A0C]">
                  {subtotal.toLocaleString()} DZD
                </span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Livraison estimée :</span>
                <span className="font-mono text-[#C5A880]">Calculée à l&apos;étape suivante</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#0A0A0C] pt-2 border-t border-[#E5E7EB]">
                <span>Total Estimé :</span>
                <span className="font-mono text-base">
                  {subtotal.toLocaleString()} DZD
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onCheckout();
              }}
              className="w-full h-12 bg-[#0A0A0C] hover:bg-[#C5A880] text-[#FFFFFF] hover:text-[#0A0A0C] font-heading font-bold text-xs uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
              <span>FINALISER LA COMMANDE</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

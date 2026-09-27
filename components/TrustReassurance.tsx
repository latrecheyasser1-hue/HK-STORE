"use client";

import React from "react";
import { Truck, PackageCheck, ShieldCheck, Headphones } from "lucide-react";

export default function TrustReassurance() {
  const pillars = [
    {
      icon: Truck,
      titleFr: "LIVRAISON 58 WILAYAS",
      titleAr: "توصيل سريع لـ 58 ولاية",
      descFr: "À domicile ou en point relais express avec Yalidine & ZR Express sous 24h à 48h.",
    },
    {
      icon: PackageCheck,
      titleFr: "INSPECTION AVANT PAIEMENT",
      titleAr: "المعاينة قبل الدفع",
      descFr: "Ouvrez et vérifiez l'état de votre montre ou coffret avant de régler le livreur.",
    },
    {
      icon: ShieldCheck,
      titleFr: "GARANTIE QUALITÉ & SAV",
      titleAr: "ضمان الجودة وخدمة ما بعد البيع",
      descFr: "Produits authentiques testés, garantie moteur 1 an et atelier physique à Chlef.",
    },
    {
      icon: Headphones,
      titleFr: "ASSISTANCE CLIENT 7J/7",
      titleAr: "خدمة الزبائن متواصلة",
      descFr: "Conseillers disponibles par appel direct et WhatsApp pour répondre à vos questions.",
    },
  ];

  return (
    <section className="w-full bg-[#F7F7F8] border-y border-[#E5E7EB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-[#FFFFFF] border border-[#E5E7EB] flex flex-col items-center text-center shadow-sm"
              >
                <div className="w-12 h-12 bg-[#0A0A0C] text-[#C5A880] flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#0A0A0C]">
                  {p.titleFr}
                </h3>
                <span className="font-arabic font-bold text-xs text-[#C5A880] mt-1">
                  {p.titleAr}
                </span>
                <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                  {p.descFr}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Phone, MapPin, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { DEPARTMENTS } from "@/data/storeData";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0A0A0C] text-[#FFFFFF] border-t border-[#27272A] pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#27272A]">
        {/* Col 1: Brand Info */}
        <div className="flex flex-col">
          <Link href="/" className="inline-block mb-2 group">
            <img
              src="/images/hk-logo-dark.png"
              alt="HK Store Chlef"
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <p className="text-xs text-[#A1A1AA] mt-4 leading-relaxed font-light">
            Boutique de référence en Algérie spécialisée dans l&apos;horlogerie de prestige, les coffrets cadeaux VIP, les parfums d&apos;exception et la maroquinerie haut de gamme.
          </p>

          <div className="mt-6 flex flex-col gap-3 text-xs text-[#D4D4D8]">
            <a
              href="https://maps.app.goo.gl/hueVRXbrsJ4i39Du9?g_st=it"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 hover:text-[#C5A880] transition-colors cursor-pointer group"
            >
              <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5 stroke-[1.5] group-hover:scale-110 transition-transform" />
              <span>Boulevard Mokdad, Chlef Centre (Voir sur Google Maps)</span>
            </a>
            <a
              href="tel:0792746456"
              className="flex items-center gap-2.5 hover:text-[#C5A880] transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#C5A880] shrink-0 stroke-[1.5]" />
              <span className="font-mono">0792 74 64 56</span>
            </a>
            <a
              href="https://wa.me/213792746456?text=Bonjour%20HK%20Store%20Chlef"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-[#25D366] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 stroke-[1.5]" />
              <span className="font-mono font-bold">WhatsApp : 0792 74 64 56</span>
            </a>

            {/* Social Network Action Buttons */}
            <div className="mt-3 pt-3 border-t border-[#27272A] flex flex-wrap gap-2">
              <a
                href="https://www.instagram.com/hkstore_chlef?stkn=MXcxbWdkazV1bHk4ZA=="
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-[#18181B] hover:bg-[#E1306C] text-[#FFFFFF] border border-[#27272A] hover:border-[#E1306C] text-[10px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/share/1E8jBtYmH4/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-[#18181B] hover:bg-[#1877F2] text-[#FFFFFF] border border-[#27272A] hover:border-[#1877F2] text-[10px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Facebook
              </a>
              <a
                href="https://www.tiktok.com/@hk.store.02?_r=1&_t=ZS-9A3Zof1NXU7"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-[#18181B] hover:bg-[#FFFFFF] hover:text-[#0A0A0C] text-[#FFFFFF] border border-[#27272A] hover:border-[#FFFFFF] text-[10px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                TikTok
              </a>
              <a
                href="https://maps.app.goo.gl/hueVRXbrsJ4i39Du9?g_st=it"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-[#18181B] hover:bg-[#C5A880] hover:text-[#0A0A0C] text-[#C5A880] border border-[#27272A] hover:border-[#C5A880] text-[10px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Maps
              </a>
            </div>
          </div>
        </div>

        {/* Col 2: 8 Departments Quick Links */}
        <div>
          <h4 className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#FFFFFF] mb-4 pb-2 border-b border-[#27272A]">
            LES 8 DÉPARTEMENTS
          </h4>
          <ul className="space-y-2 text-xs text-[#A1A1AA]">
            {DEPARTMENTS.map((dept) => (
              <li key={dept.id}>
                <a
                  href={`#${dept.id}`}
                  className="hover:text-[#C5A880] transition-colors flex items-center justify-between"
                >
                  <span>{dept.nameFr.replace(/^[0-9]+\.\s*/, "")}</span>
                  <span className="font-arabic text-[11px] text-[#71717A] dir-rtl">
                    {dept.nameAr}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Delivery & FAQ */}
        <div>
          <h4 className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#FFFFFF] mb-4 pb-2 border-b border-[#27272A]">
            LIVRAISON & ASSISTANCE
          </h4>
          <ul className="space-y-2.5 text-xs text-[#A1A1AA]">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#C5A880]" />
              <span>Expédition Yalidine Express 58 Wilayas</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#C5A880]" />
              <span>Délai de livraison : 24h à 48h</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#C5A880]" />
              <span>Paiement Cash on Delivery (COD)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#C5A880]" />
              <span>Inspection de la marchandise autorisée</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#C5A880]" />
              <span>Garantie échange 48h en cas d&apos;anomalie</span>
            </li>
            <li>
              <Link href="/admin" className="text-[#C5A880] hover:underline font-heading font-bold uppercase text-[10px] tracking-wider mt-3 inline-block">
                → Accès Administration & Yalidine
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Newsletter & Guarantee */}
        <div>
          <h4 className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#FFFFFF] mb-4 pb-2 border-b border-[#27272A]">
            CONFIDENTIALITÉ & SÉCURITÉ
          </h4>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Rejoignez le club privilège HK STORE pour recevoir en avant-première nos arrivages de coffrets et éditions limitées.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex">
            <input
              type="text"
              placeholder="Votre numéro ou e-mail"
              className="w-full h-11 px-3 bg-[#18181B] border border-[#27272A] text-xs text-[#FFFFFF] focus:outline-none focus:border-[#C5A880]"
            />
            <button
              type="submit"
              className="h-11 px-4 bg-[#FFFFFF] hover:bg-[#C5A880] text-[#0A0A0C] hover:text-[#FFFFFF] font-heading font-bold text-[10px] uppercase tracking-wider shrink-0 transition-colors"
            >
              OK
            </button>
          </form>

          <div className="mt-6 p-3 bg-[#18181B]/60 border border-[#27272A] flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#C5A880] shrink-0 stroke-[1.5]" />
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wide">
              Paiement 100% sécurisé à la livraison partout en Algérie
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#71717A] gap-4">
        <span>
          © {new Date().getFullYear()} HK STORE Chlef. Tous droits réservés.
        </span>
        <span className="font-arabic">
          المتجر الرسمي لعلامة HK STORE بولاية الشلف و58 ولاية جزائرية
        </span>
      </div>
    </footer>
  );
}

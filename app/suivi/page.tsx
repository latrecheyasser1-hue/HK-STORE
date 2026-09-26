"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  ChevronRight,
  Package,
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SuiviCommandePage() {
  const [trackingQuery, setTrackingQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingQuery.trim()) return;

    setHasSearched(true);
    setIsLoading(true);
    setNotFound(false);

    try {
      const res = await fetch(`/api/tracking?query=${encodeURIComponent(trackingQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.found && data.order) {
        setSearchResult(data.order);
        setNotFound(false);
      } else {
        setSearchResult(null);
        setNotFound(true);
      }
    } catch (err) {
      setSearchResult(null);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#111827]">
      <Navbar
        onOpenSearch={() => {}}
        onOpenCart={() => {}}
        onOpenMenu={() => {}}
        cartCount={0}
      />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-[#0A0A0C] text-[#FFFFFF] py-14 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <span className="font-heading font-extrabold text-[10px] uppercase tracking-[0.3em] text-[#C5A880]">
              HK STORE CHLEF • SUIVI LOGISTIQUE
            </span>
            <h1 className="font-heading font-black text-2xl sm:text-4xl uppercase tracking-tight text-[#FFFFFF] mt-2">
              Suivi de Commande & Colis Yalidine
            </h1>
            <p className="font-arabic text-sm text-[#9CA3AF] mt-1.5 dir-rtl">
              تتبع شحنتك المباشرة عبر 58 ولاية مع ياليدين إكسبريس
            </p>

            {/* Tracking Input Card */}
            <form
              onSubmit={handleTrack}
              className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  required
                  placeholder="Ex: HK-104928 ou votre numéro de téléphone"
                  value={trackingQuery}
                  onChange={(e) => setTrackingQuery(e.target.value)}
                  className="w-full h-12 px-4 bg-[#1C1B1D] text-[#FFFFFF] border border-[#3F3F46] focus:border-[#C5A880] focus:outline-none text-xs font-mono placeholder:text-[#78767B]"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto h-12 px-7 bg-[#C5A880] hover:bg-[#FFFFFF] text-[#0A0A0C] font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shrink-0 disabled:opacity-50"
              >
                <Search className="w-4 h-4 stroke-[2]" />
                <span>{isLoading ? "Recherche en cours..." : "Rechercher"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Tracking Results Area */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {isLoading && (
            <div className="py-12 text-center">
              <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-xs text-[#6B7280] font-mono">Connexion à la base de données HK STORE...</p>
            </div>
          )}

          {notFound && !isLoading && (
            <div className="bg-[#FFF5F5] border border-[#FCA5A5] p-6 text-center">
              <AlertCircle className="w-8 h-8 text-[#DC2626] mx-auto mb-2" />
              <h4 className="font-heading font-bold text-sm text-[#991B1B] uppercase">
                Aucune commande trouvée
              </h4>
              <p className="text-xs text-[#7F1D1D] mt-1">
                Veuillez vérifier votre numéro de commande (ex: HK-1001) ou le numéro de téléphone utilisé lors de votre commande.
              </p>
              <p className="font-arabic text-xs text-[#7F1D1D] mt-1">
                لم يتم العثور على أي طلب بهذا الرقم، يرجى التأكد من رقم الهاتف أو رقم الطلب
              </p>
            </div>
          )}

          {hasSearched && searchResult && !isLoading && (
            <div className="bg-[#FFFFFF] border-2 border-[#0A0A0C] p-6 sm:p-8 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E5E7EB] gap-4">
                <div>
                  <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                    Statut Actuel
                  </span>
                  <h3 className="font-heading font-extrabold text-xl uppercase tracking-tight text-[#0A0A0C] mt-1">
                    {searchResult.status}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[#6B7280] mt-1 font-mono">
                    <span>N° Commande : {searchResult.orderId}</span>
                    <span>•</span>
                    <span>Bordereau Yalidine : {searchResult.yalidineTracking}</span>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 bg-[#10B981]/10 text-[#10B981] font-heading font-bold text-xs uppercase tracking-wider self-start sm:self-auto border border-[#10B981]/20">
                  En Acheminement
                </div>
              </div>

              {/* Inspection Notice */}
              <div className="my-6 p-4 bg-[#F7F7F8] border border-[#E5E7EB] flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#C5A880] shrink-0" />
                <p className="text-xs text-[#374151] leading-relaxed">
                  <strong>Rappel important :</strong> Vous n'avez rien payé à l'avance. À l'arrivée du livreur, examinez l'article avant de payer en espèces.
                </p>
              </div>

              {/* Timeline Steps */}
              <div className="space-y-6 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-[#E5E7EB]">
                {searchResult.timeline.map((step: any, idx: number) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div
                      className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        step.completed
                          ? "bg-[#0A0A0C] text-[#FFFFFF]"
                          : "bg-[#E5E7EB] text-[#9CA3AF]"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        idx + 1
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#0A0A0C]">
                          {step.title}
                        </h4>
                        <span className="text-[10px] font-mono text-[#6B7280]">{step.time}</span>
                      </div>
                      <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct Support Contact */}
              <div className="mt-8 pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-[#6B7280]">
                  Besoin d'une modification d'adresse ou d'un horaire spécifique ?
                </span>
                <a
                  href={`https://wa.me/213550000000?text=Bonjour%20HK%20Store,%20je%20souhaite%20des%20informations%20sur%20ma%20commande%20${searchResult.orderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#0A0A0C] hover:bg-[#C5A880] text-[#FFFFFF] hover:text-[#0A0A0C] font-heading font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Contacter le Support WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* Showroom & Assistance Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="p-6 border border-[#E5E7EB] bg-[#F7F7F8]">
              <MapPin className="w-6 h-6 text-[#C5A880] mb-2" />
              <h3 className="font-heading font-bold text-sm uppercase text-[#0A0A0C]">
                Showroom Physique HK STORE Chlef
              </h3>
              <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                Boulevard Mokdad, Centre-Ville, Chlef (02000), Algérie.
                <br />
                Ouvert 7 jours sur 7 de 09:00 à 20:30.
              </p>
            </div>

            <div className="p-6 border border-[#E5E7EB] bg-[#F7F7F8]">
              <Phone className="w-6 h-6 text-[#C5A880] mb-2" />
              <h3 className="font-heading font-bold text-sm uppercase text-[#0A0A0C]">
                Conciergerie Téléphonique
              </h3>
              <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                Assistance directe pour le suivi de vos colis et conseils horlogers :
                <br />
                <strong className="font-mono text-[#0A0A0C]">0550 XX XX XX / 0660 XX XX XX</strong>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

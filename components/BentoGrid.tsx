"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp, Watch, Gift, Glasses, Briefcase } from "lucide-react";
import { DEPARTMENTS } from "@/data/storeData";

interface BentoGridProps {
  onSelectCategory: (deptId: string) => void;
}

export default function BentoGrid({ onSelectCategory }: BentoGridProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>("dept-montres");

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const bentoDepts = DEPARTMENTS.slice(0, 4);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto" id="univers-bento">
      <div className="flex flex-col mb-8 text-center sm:text-left">
        <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
          <span className="w-2 h-2 bg-[#C5A880]" />
          <span className="font-heading text-[10px] uppercase font-bold tracking-[0.25em] text-[#C5A880]">
            UNIVERS HK STORE • CHLEF
          </span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0A0A0C] uppercase tracking-[0.06em]">
          DÉPARTEMENTS DE PRESTIGE
        </h2>
        <p className="font-arabic font-bold text-sm text-[#6B7280] mt-1">
          تصفح الأقسام الحصرية واكتشف أرقى التشكيلات مع ضمان الجودة
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bentoDepts.map((dept) => {
          const isOpen = activeAccordion === dept.id;
          return (
            <div
              key={dept.id}
              className="border border-[#E5E7EB] bg-[#FFFFFF] overflow-hidden transition-all shadow-sm"
              id={dept.id}
            >
              <div
                className="relative h-44 sm:h-52 bg-[#0A0A0C] cursor-pointer group overflow-hidden"
                onClick={() => toggleAccordion(dept.id)}
              >
                <img
                  src={dept.image}
                  alt={dept.nameFr}
                  className="w-full h-full object-cover object-center filter brightness-[0.65] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/40 to-transparent flex items-end justify-between p-4">
                  <div>
                    <h3 className="font-heading text-sm sm:text-base text-[#FFFFFF] font-bold uppercase tracking-wide">
                      {dept.nameFr}
                    </h3>
                    <span className="font-arabic text-xs text-[#C5A880] font-bold">
                      {dept.nameAr}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#FFFFFF]/20 backdrop-blur-md flex items-center justify-center text-[#FFFFFF] group-hover:bg-[#C5A880] transition-colors">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 stroke-[1.5]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 stroke-[1.5]" />
                    )}
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="p-3.5 bg-[#F7F7F8] border-t border-[#E5E7EB] transition-all">
                  <div className="grid grid-cols-2 gap-2.5">
                    {dept.subcategories.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/collection/${dept.slug}?sub=${sub.slug}`}
                        className="p-3 bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#C5A880] flex flex-col justify-between transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-heading text-[10px] font-bold uppercase text-[#0A0A0C] group-hover:text-[#C5A880]">
                            {sub.nameFr}
                          </span>
                        </div>
                        <span className="font-arabic text-[11px] text-[#6B7280] mt-1 text-right dir-rtl">
                          {sub.nameAr}
                        </span>
                        <div className="mt-2 pt-1.5 border-t border-[#F3F4F6] flex items-center justify-between text-[#0A0A0C] group-hover:text-[#C5A880] font-heading text-[9px] uppercase tracking-wider">
                          <span>Explorer</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform stroke-[1.5]" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

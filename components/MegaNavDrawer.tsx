"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { DEPARTMENTS } from "@/data/storeData";

interface MegaNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDepartment?: (deptId: string) => void;
}

export default function MegaNavDrawer({
  isOpen,
  onClose,
  onSelectDepartment,
}: MegaNavDrawerProps) {
  const [expandedId, setExpandedId] = useState<string | null>("dept-montres");

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex transition-opacity duration-300">
      <div className="relative w-[88%] max-w-[360px] h-full bg-[#FFFFFF] flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="h-16 px-4 bg-[#0A0A0C] text-[#FFFFFF] flex items-center justify-between shrink-0 border-b border-[#27272A]">
          <div className="flex items-center">
            <img
              src="/images/hk-logo-dark.png"
              alt="HK Store Chlef"
              className="h-10 w-auto object-contain"
            />
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#C5A880] transition-colors"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Subheader */}
        <div className="p-4 bg-[#F7F7F8] border-b border-[#E5E7EB] flex items-center justify-between">
          <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-[#0A0A0C]">
            8 DÉPARTEMENTS • الأقسام الرسمية
          </span>
          <span className="text-[10px] text-[#C5A880] font-mono font-bold">
            58 WILAYAS COD
          </span>
        </div>

        {/* Departments List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#F3F4F6]">
          {DEPARTMENTS.map((dept) => {
            const isExpanded = expandedId === dept.id;
            return (
              <div key={dept.id} className="py-1 px-4">
                <div
                  className="flex items-center justify-between py-3 cursor-pointer group"
                  onClick={() => toggleExpand(dept.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#C5A880]" />
                    <div className="flex flex-col">
                      <span className="font-heading text-xs font-bold uppercase text-[#0A0A0C] group-hover:text-[#C5A880] transition-colors">
                        {dept.nameFr}
                      </span>
                      <span className="text-[11px] text-[#6B7280] dir-rtl font-arabic">
                        {dept.nameAr}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#6B7280] stroke-[1.5]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6B7280] stroke-[1.5]" />
                  )}
                </div>

                {isExpanded && (
                  <div className="pl-6 pr-2 pb-3 pt-1 flex flex-col gap-2 bg-[#F7F7F8] text-xs">
                    {dept.subcategories.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/collection/${dept.slug}?sub=${sub.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between py-1.5 px-2 hover:bg-[#FFFFFF] text-[#111827] hover:text-[#0A0A0C] transition-colors border-l-2 border-[#C5A880]"
                      >
                        <span className="font-heading text-[11px] font-medium">
                          • {sub.nameFr}
                        </span>
                        <span className="dir-rtl text-[#6B7280] text-[11px] font-arabic">
                          {sub.nameAr}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

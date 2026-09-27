"use client";

import React from "react";
import { DEPARTMENTS } from "@/data/storeData";

interface DepartmentFilterPillsProps {
  selectedDept: string;
  onSelectDept: (deptId: string) => void;
}

export default function DepartmentFilterPills({
  selectedDept,
  onSelectDept,
}: DepartmentFilterPillsProps) {
  return (
    <section className="w-full bg-[#F7F7F8] py-3.5 px-4 border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectDept("all")}
          className={`px-4 py-2 font-heading text-[10px] tracking-wider uppercase transition-colors shrink-0 ${
            selectedDept === "all"
              ? "bg-[#0A0A0C] text-[#FFFFFF]"
              : "bg-[#FFFFFF] text-[#111827] hover:bg-[#E5E7EB] border border-[#E5E7EB]"
          }`}
        >
          TOUS • الكل
        </button>

        {DEPARTMENTS.map((dept) => {
          const isActive = selectedDept === dept.id;
          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => onSelectDept(dept.id)}
              className={`px-4 py-2 font-heading text-[10px] tracking-wider uppercase transition-colors shrink-0 ${
                isActive
                  ? "bg-[#0A0A0C] text-[#FFFFFF]"
                  : "bg-[#FFFFFF] text-[#111827] hover:bg-[#E5E7EB] border border-[#E5E7EB]"
              }`}
            >
              {dept.nameFr.replace(/^[0-9]+\.\s*/, "")}
            </button>
          );
        })}
      </div>
    </section>
  );
}

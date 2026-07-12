import React from "react";
import { Utensils, Coffee, Beer, Hotel, Ticket, Sparkles } from "lucide-react";
import type { PlaceCategory } from "@/utils/category";

const CATEGORY_STYLES: Record<PlaceCategory, { bg: string; text: string; border: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  FOOD: { bg: "bg-rose-50/80", text: "text-rose-700", border: "border-rose-200/40", label: "맛집 · 식음료", icon: Utensils },
  CAFE: { bg: "bg-amber-50/80", text: "text-amber-700", border: "border-amber-200/40", label: "카페 · 디저트", icon: Coffee },
  BAR: { bg: "bg-violet-50/80", text: "text-violet-750", border: "border-violet-200/40", label: "술집 · 주점", icon: Beer },
  STAY: { bg: "bg-emerald-50/80", text: "text-emerald-700", border: "border-emerald-200/40", label: "숙소 · 숙박", icon: Hotel },
  PLAY: { bg: "bg-sky-50/80", text: "text-sky-700", border: "border-sky-200/40", label: "놀거리 · 여가", icon: Ticket },
  OTHER: { bg: "bg-slate-50/80", text: "text-slate-700", border: "border-slate-200/40", label: "기타", icon: Sparkles },
};

export function CategoryBadge({ category, className = "" }: { category: PlaceCategory; className?: string }) {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.OTHER;
  const Icon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wide ${style.bg} ${style.text} ${style.border} ${className}`}>
      <Icon className="w-3 h-3 stroke-[2.5px] shrink-0" />
      <span>{style.label}</span>
    </span>
  );
}

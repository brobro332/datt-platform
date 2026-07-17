"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RecommendationResponse, AnchorPlaceCategory } from "@/services/anchorService";
import { PlaceThumbnail } from "@/components/common/PlaceThumbnail";
import type { PlaceNearbyResponse } from "@/types/place";

type RecommendationSectionProps = {
  recommendations: RecommendationResponse;
};

const CATEGORY_LABELS: Record<AnchorPlaceCategory, string> = {
  FOOD: "맛집",
  CAFE: "카페",
  BAR: "술집",
  STAY: "숙소",
  PLAY: "놀거리",
};

const CATEGORY_THEMES: Record<AnchorPlaceCategory, { text: string; bg: string; border: string }> = {
  FOOD: { text: "text-rose-600", bg: "bg-rose-50/70", border: "border-rose-100" },
  CAFE: { text: "text-amber-600", bg: "bg-amber-50/70", border: "border-amber-100" },
  BAR: { text: "text-violet-600", bg: "bg-violet-50/70", border: "border-violet-100" },
  STAY: { text: "text-emerald-600", bg: "bg-emerald-50/70", border: "border-emerald-100" },
  PLAY: { text: "text-sky-600", bg: "bg-sky-50/70", border: "border-sky-100" },
};

export function RecommendationSection({ recommendations }: RecommendationSectionProps) {
  const router = useRouter();

  // Active tab state: 'ALL' | AnchorPlaceCategory
  const [activeTab, setActiveTab] = useState<"ALL" | AnchorPlaceCategory>("ALL");

  // Flatten all places and attach category info
  const allPlaces = (Object.entries(recommendations) as [AnchorPlaceCategory, PlaceNearbyResponse[]][]).reduce<(PlaceNearbyResponse & { category: AnchorPlaceCategory })[]>((acc, [category, places]) => {
    const placesWithCategory = (places || []).map(p => ({ ...p, category }));
    return [...acc, ...placesWithCategory];
  }, []);

  // Filter display places based on active tab
  const displayPlaces = activeTab === "ALL"
    ? allPlaces
    : (recommendations[activeTab] || []).map(p => ({ ...p, category: activeTab }));

  const tabs: { key: "ALL" | AnchorPlaceCategory; label: string; count: number; icon: string }[] = [
    { key: "ALL", label: "전체", count: allPlaces.length, icon: "⚓" },
    { key: "FOOD", label: "맛집", count: recommendations.FOOD?.length ?? 0, icon: "🍜" },
    { key: "CAFE", label: "카페", count: recommendations.CAFE?.length ?? 0, icon: "☕" },
    { key: "BAR", label: "술집", count: recommendations.BAR?.length ?? 0, icon: "🍺" },
    { key: "STAY", label: "숙소", count: recommendations.STAY?.length ?? 0, icon: "🏨" },
    { key: "PLAY", label: "놀거리", count: recommendations.PLAY?.length ?? 0, icon: "🎡" },
  ];

  return (
    <div className="space-y-6">
      {/* Category tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-1.5 rounded-2xl bg-slate-100/70 border border-slate-200/50 backdrop-blur-sm w-full">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 w-full ${
                isSelected
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200/30"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                isSelected 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "bg-slate-200/60 text-slate-500"
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Recommended list grid */}
      {displayPlaces.length === 0 ? (
        <div className="py-16 text-center text-slate-400 font-bold bg-white/50 backdrop-blur-sm rounded-[2rem] border border-slate-200/40">
          이 지역 반경 내에 해당 카테고리의 장소가 아직 없습니다.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {displayPlaces.map((place) => {
            const cat = place.category as AnchorPlaceCategory;
            const theme = CATEGORY_THEMES[cat];

            return (
              <button
                key={place.id}
                type="button"
                onClick={() => router.push(`/place-search/${place.id}`)}
                className="w-full text-left focus:outline-none cursor-pointer flex items-center gap-4 rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-200 group"
              >
                <PlaceThumbnail placeId={place.id} indsMclsNm={cat} thumbnailUrl={place.thumbnailUrl} className="h-16 w-16 rounded-2xl" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold ${theme.bg} ${theme.text}`}>
                      {CATEGORY_LABELS[cat]}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      📏 {place.distanceKm.toFixed(2)}km 거리
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-800 text-sm md:text-base truncate group-hover:text-indigo-600 transition-colors">
                    {place.bizesNm}
                  </h4>

                  <p className="mt-0.5 text-xs font-semibold text-slate-400 truncate">
                    📍 {place.rdnmAdr}
                  </p>
                </div>

                {/* Score and Review Count */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-100/50">
                    <span className="text-amber-500">★</span>
                    {place.averageRating.toFixed(1)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    💬 {place.reviewCount}개 리뷰
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

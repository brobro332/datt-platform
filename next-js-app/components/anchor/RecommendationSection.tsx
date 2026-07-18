"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import type { RecommendationResponse, AnchorPlaceCategory } from "@/services/anchorService";
import { PlaceThumbnail } from "@/components/common/PlaceThumbnail";
import type { PlaceNearbyResponse } from "@/types/place";
import { searchPlaceMasters } from "@/services/placeMasterService";
import type { PlaceMasterSearchResponse } from "@/types/placeMaster";

type RecommendationSectionProps = {
  recommendations: RecommendationResponse;
  excludedPlaceIds: number[];
  replacedPlaces: Record<number, PlaceNearbyResponse>;
  onExclude: (placeId: number) => void;
  onInclude: (placeId: number) => void;
  onReplace: (oldPlaceId: number, newPlace: PlaceNearbyResponse) => void;
  baseLat: number;
  baseLon: number;
  province?: string;
  district?: string;
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

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function RecommendationSection({
  recommendations,
  excludedPlaceIds,
  replacedPlaces,
  onExclude,
  onInclude,
  onReplace,
  baseLat,
  baseLon,
  province,
  district,
}: RecommendationSectionProps) {
  const router = useRouter();

  // Active tab state: 'ALL' | AnchorPlaceCategory
  const [activeTab, setActiveTab] = useState<"ALL" | AnchorPlaceCategory>("ALL");

  // Modal State for search replacement
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replacingInfo, setReplacingInfo] = useState<{ oldPlaceId: number; category: AnchorPlaceCategory } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceMasterSearchResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Flatten all places and attach category info, taking replacements into account
  const allPlaces = (Object.entries(recommendations) as [AnchorPlaceCategory, PlaceNearbyResponse[]][]).reduce<(PlaceNearbyResponse & { category: AnchorPlaceCategory })[]>((acc, [category, places]) => {
    const placesWithCategory = (places || []).map(p => {
      const displayPlace = replacedPlaces[p.id] || p;
      return { ...displayPlace, category };
    });
    return [...acc, ...placesWithCategory];
  }, []);

  // Filter display places based on active tab
  const displayPlaces = activeTab === "ALL"
    ? allPlaces
    : (recommendations[activeTab] || []).map(p => {
        const displayPlace = replacedPlaces[p.id] || p;
        return { ...displayPlace, category: activeTab };
      });

  const tabs: { key: "ALL" | AnchorPlaceCategory; label: string; count: number; icon: string }[] = [
    { key: "ALL", label: "전체", count: allPlaces.length, icon: "⚓" },
    { key: "FOOD", label: "맛집", count: recommendations.FOOD?.length ?? 0, icon: "🍜" },
    { key: "CAFE", label: "카페", count: recommendations.CAFE?.length ?? 0, icon: "☕" },
    { key: "BAR", label: "술집", count: recommendations.BAR?.length ?? 0, icon: "🍺" },
    { key: "STAY", label: "숙소", count: recommendations.STAY?.length ?? 0, icon: "🏨" },
    { key: "PLAY", label: "놀거리", count: recommendations.PLAY?.length ?? 0, icon: "🎡" },
  ];

  const handleOpenReplace = (oldPlaceId: number, category: AnchorPlaceCategory) => {
    setReplacingInfo({ oldPlaceId, category });
    setSearchQuery("");
    setSearchResults([]);
    setIsModalOpen(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const res = await searchPlaceMasters(
        searchQuery,
        province || undefined,
        district || undefined
      );
      setSearchResults(res.content || []);
    } catch (err) {
      console.error("Failed to search place masters for replacement", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectReplacement = (selectedPlace: PlaceMasterSearchResponse) => {
    if (!replacingInfo) return;

    const distance = calculateDistanceKm(baseLat, baseLon, selectedPlace.lat, selectedPlace.lon);

    const mappedPlace: PlaceNearbyResponse = {
      id: selectedPlace.id,
      bizesNm: selectedPlace.bizesNm,
      brchNm: selectedPlace.brchNm,
      indsMclsCd: selectedPlace.indsMclsCd,
      indsMclsNm: selectedPlace.indsMclsNm,
      ctprvnNm: selectedPlace.ctprvnNm,
      signguNm: selectedPlace.signguNm,
      adongNm: selectedPlace.adongNm,
      rdnmAdr: selectedPlace.rdnmAdr,
      lon: selectedPlace.lon,
      lat: selectedPlace.lat,
      distanceKm: distance,
      averageRating: 0,
      reviewCount: 0,
      thumbnailUrl: null,
    };

    onReplace(replacingInfo.oldPlaceId, mappedPlace);
    setIsModalOpen(false);
  };

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
            const isExcluded = excludedPlaceIds.includes(place.id);

            return (
              <div
                key={place.id}
                className={`relative flex items-center justify-between rounded-2xl border bg-white/85 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all duration-200 group ${
                  isExcluded 
                    ? "opacity-50 border-slate-200 bg-slate-50/50" 
                    : "border-slate-200/50 hover:border-slate-350"
                }`}
              >
                {/* Clickable Area to view details */}
                <button
                  type="button"
                  disabled={isExcluded}
                  onClick={() => router.push(`/place-search/${place.id}`)}
                  className="flex-1 min-w-0 flex items-center gap-4 text-left cursor-pointer focus:outline-none disabled:cursor-not-allowed"
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
                </button>

                {/* Actions Column */}
                <div className="flex flex-col items-end justify-between min-h-[64px] ml-4 shrink-0 gap-2">
                  <div className="flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-100/50">
                    <span className="text-amber-500">★</span>
                    {place.averageRating.toFixed(1)}
                  </div>
                  
                  <div className="flex gap-1.5 mt-auto">
                    {isExcluded ? (
                      <button
                        type="button"
                        onClick={() => onInclude(place.id)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-[10px] font-black tracking-wider transition cursor-pointer"
                      >
                        복구
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenReplace(place.id, cat)}
                          className="px-2 py-1 rounded-lg border border-slate-200 hover:border-slate-350 bg-white text-slate-550 text-[10px] font-black tracking-wider transition cursor-pointer"
                        >
                          교체
                        </button>
                        <button
                          type="button"
                          onClick={() => onExclude(place.id)}
                          className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-650 text-[10px] font-black tracking-wider transition cursor-pointer"
                        >
                          제외
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Place Replacement Search Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/50 shadow-2xl p-6 relative flex flex-col max-h-[80vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 pr-6">
              🔍 추천 매장 교체하기
            </h3>
            <p className="text-xs font-semibold text-slate-450 mt-1">
              이 지역 상권 내의 다른 매장을 검색하여 추천 목록의 매장과 교체할 수 있습니다.
            </p>

            <form onSubmit={handleSearch} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-white text-slate-800"
                  placeholder="매장 이름 검색 (예: 스타벅스)"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition cursor-pointer disabled:bg-slate-300"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "검색"}
              </button>
            </form>

            <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                  <span className="text-xs font-bold text-slate-400">매장을 검색 중입니다...</span>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <h4 className="text-sm font-extrabold text-slate-800 truncate">
                        {item.bizesNm} {item.brchNm ? `(${item.brchNm})` : ""}
                      </h4>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">
                        {item.indsMclsNm} | {item.rdnmAdr}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectReplacement(item)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black transition cursor-pointer shrink-0"
                    >
                      교체 선택
                    </button>
                  </div>
                ))
              ) : searchQuery && !isSearching ? (
                <div className="py-12 text-center text-xs font-bold text-slate-400">
                  검색 결과가 없습니다.
                </div>
              ) : (
                <div className="py-12 text-center text-xs font-bold text-slate-400">
                  상호명을 입력하고 검색해 주세요.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

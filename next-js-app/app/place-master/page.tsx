"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { env } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";
import { LoginGuideModal } from "@/components/common/LoginGuideModal";

import { MainLayout } from "@/layouts/MainLayout";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { PlaceMasterListItem } from "@/components/place-master/PlaceMasterListItem";
import { PlaceFilterChips } from "@/components/place-search/PlaceFilterChips";
import type { PlaceMasterSearchResponse } from "@/types/placeMaster";

import { useCreateAnchor } from "@/hooks/useAnchorMutation";
import {
  usePlaceMasterSearch,
  useProvinces,
  useDistricts,
  useRegionCenter,
  useSubwayStations,
} from "@/hooks/usePlaceMasterSearch";
import { useAnchorRecommendations } from "@/hooks/useAnchorRecommendations";
import { RecommendationSection } from "@/components/anchor/RecommendationSection";
import { 
  MapPin, 
  Search, 
  Anchor, 
  ArrowLeft, 
  ArrowUp, 
  X, 
  Map, 
  Compass, 
  HelpCircle,
  Train
} from "lucide-react";

const FILTER_TO_CATEGORY: Record<string, string> = {
  "맛집": "FOOD",
  "카페": "CAFE",
  "술집": "BAR",
  "숙소": "STAY",
  "놀거리": "PLAY",
};

interface CustomDropdownProps {
  label: string;
  value: string;
  options: string[] | undefined;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
}

function CustomDropdown({
  label,
  value,
  options,
  onChange,
  disabled,
  placeholder,
  icon: IconComponent,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Clear query when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredOptions = options?.filter((opt) =>
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`relative w-full ${isOpen ? "z-50" : "z-10"}`}>
      <label className="block text-[11px] font-black text-slate-450 uppercase tracking-widest mb-2 ml-1">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white/95 px-4.5 py-2 text-sm font-bold text-slate-700 outline-none transition-all duration-300 hover:border-indigo-400 hover:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-40 disabled:bg-slate-50/50 disabled:cursor-not-allowed text-left cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      >
        <span className="flex items-center gap-2 truncate">
          <IconComponent className={`w-4 h-4 shrink-0 ${value ? "text-indigo-600" : "text-slate-400"}`} />
          {value ? (
            <span className="text-slate-800 font-extrabold truncate">{value}</span>
          ) : (
            <span className="text-slate-400 font-semibold truncate">{placeholder}</span>
          )}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2.5 z-50 max-h-60 overflow-y-auto rounded-3xl border border-slate-200/60 bg-white/95 backdrop-blur-xl px-2 pb-2 pt-0 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="sticky top-0 bg-white pb-2 pt-2 px-1 z-10 border-b border-slate-100 mb-1 rounded-t-2xl">
              <input
                type="text"
                placeholder={`${label} 검색...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-9 px-3.5 rounded-xl border border-slate-200 text-xs font-bold outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 bg-slate-50/50"
              />
            </div>

            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="flex w-full items-center rounded-xl px-4 py-2.5 text-xs font-black text-slate-450 hover:bg-slate-50 hover:text-slate-650 transition cursor-pointer"
              >
                전체보기
              </button>
              {filteredOptions && filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center rounded-2xl px-4 py-3 text-sm font-bold transition cursor-pointer ${
                      value === opt
                        ? "bg-indigo-50 text-indigo-650 font-black shadow-sm"
                        : "text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-600"
                    }`}
                  >
                    <IconComponent className="mr-2 w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate">{opt}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-xs font-bold text-slate-450 text-center">
                  검색 결과 없음
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function PlaceMasterPage() {
  const router = useRouter();

  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  
  const [submittedRegion, setSubmittedRegion] = useState<{province: string, district: string} | null>(null);
  const [creatingAnchor, setCreatingAnchor] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [searchTab, setSearchTab] = useState<"region" | "subway">("region");

  const [selectedSubway, setSelectedSubway] = useState<any | null>(null);
  const [customCenter, setCustomCenter] = useState<[number, number] | null>(null);

  // Fetch subway stations: query all if in subway tab, query filtered if in region tab
  const { data: subwayStationsData } = useSubwayStations(
    searchTab === "subway" 
      ? undefined 
      : { province: selectedProvince || null, district: selectedDistrict || null }
  );

  const subwayStations = subwayStationsData 
    ? [...subwayStationsData].sort((a, b) => a.name.localeCompare(b.name))
    : [];

  // Reset selected subway and custom center when region changes in region tab
  useEffect(() => {
    if (searchTab === "region") {
      setSelectedSubway(null);
      setCustomCenter(null);
    }
  }, [selectedProvince, selectedDistrict, searchTab]);

  // Store Name Filter States
  const [filterInput, setFilterInput] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("전체");

  // Scroll to Top States
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [isLoginGuideOpen, setIsLoginGuideOpen] = useState(false);

  // Anchor Title Modal States
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [anchorTitle, setAnchorTitle] = useState("");

  const createAnchorMutation = useCreateAnchor();

  const { data: provinces } = useProvinces();
  const { data: districts } = useDistricts(selectedProvince || null);

  const { data: regionCenter } = useRegionCenter({
    province: submittedRegion?.province || null,
    district: submittedRegion?.district || null,
    enabled: showRecommendations && !customCenter,
  });

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
  } = usePlaceMasterSearch({
    province: submittedRegion?.province,
    district: submittedRegion?.district,
    keyword: appliedKeyword,
    category: selectedFilter !== "전체" ? FILTER_TO_CATEGORY[selectedFilter] : undefined,
    enabled: !!submittedRegion,
  });

  const { data: recommendations, isLoading: isRecommending } = useAnchorRecommendations({
    lat: customCenter?.[0] || null,
    lon: customCenter?.[1] || null,
    province: customCenter ? null : submittedRegion?.province,
    district: customCenter ? null : submittedRegion?.district,
    enabled: showRecommendations,
  });

  const placeMasters = data ? data.pages.flatMap((page) => page.content) : [];
  const displayPlaces = placeMasters;

  function handleRegionSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    if (!selectedProvince || !selectedDistrict) return;

    setSubmittedRegion({ province: selectedProvince, district: selectedDistrict });
    setShowRecommendations(false);
    setFilterInput("");
    setAppliedKeyword("");
    setSelectedFilter("전체");

    if (searchTab === "region") {
      setCustomCenter(null);
      setSelectedSubway(null);
    }
  }

  async function handleCreateAnchor(customTitle: string) {
    if (!submittedRegion || (!regionCenter && !customCenter)) return;

    const todayStr = getTodayString();
    const defaultTitle = selectedSubway 
      ? `${todayStr} ${selectedSubway.name} 닻` 
      : `${todayStr} ${submittedRegion.province} ${submittedRegion.district} 닻`;
    const finalTitle = customTitle.trim() || defaultTitle;

    const baseLat = customCenter ? customCenter[0] : regionCenter?.[0];
    const baseLon = customCenter ? customCenter[1] : regionCenter?.[1];

    const basePlaceName = selectedSubway ? selectedSubway.name : `${submittedRegion.province} ${submittedRegion.district}`;
    const baseAddress = selectedSubway ? `${submittedRegion.province} ${submittedRegion.district} ${selectedSubway.name} (${selectedSubway.line})` : `${submittedRegion.province} ${submittedRegion.district}`;

    try {
      setCreatingAnchor(true);

      const response = await createAnchorMutation.mutateAsync({
        title: finalTitle,
        basePlaceId: null,
        basePlaceName,
        baseAddress,
        baseLon: baseLon!,
        baseLat: baseLat!,
        radiusKm: 3,
        isPublic: true,
      });

      setIsTitleModalOpen(false);
      router.push(`/anchors/${response.anchorId}`);
    } finally {
      setCreatingAnchor(false);
    }
  }

  return (
    <MainLayout>
      <section className="space-y-8 pb-2">
        <div className="relative z-40 rounded-[2rem] border border-white/80 bg-white/60 backdrop-blur-xl p-8 md:p-10 shadow-[0_30px_100px_rgba(99,102,241,0.06)]">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-blue-500" /> Place Master
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
            닻내리기
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-xl font-semibold">
            DATT가 제공하는 대표 구역을 설정하여, 해당 상권의 트렌디한 명소 정보와 추천 코스를 탐색하고 나만의 닻을 내릴 수 있습니다.
          </p>

          {/* Tabs for Search Methods */}
          <div className="mt-8 flex gap-2 border-b border-slate-200/60 pb-3">
            <button
              type="button"
              onClick={() => {
                setSearchTab("region");
                setSelectedSubway(null);
                setCustomCenter(null);
                setSelectedProvince("");
                setSelectedDistrict("");
              }}
              className={`px-4 py-2 text-sm font-black rounded-xl transition-all duration-200 cursor-pointer ${
                searchTab === "region"
                  ? "bg-indigo-50 text-indigo-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-650 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Map className="w-4 h-4" /> 행정구역 검색
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTab("subway");
                setSelectedSubway(null);
                setCustomCenter(null);
                setSelectedProvince("");
                setSelectedDistrict("");
              }}
              className={`px-4 py-2 text-sm font-black rounded-xl transition-all duration-200 cursor-pointer ${
                searchTab === "subway"
                  ? "bg-indigo-50 text-indigo-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-650 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Train className="w-4 h-4" /> 지하철역 주변 검색
              </span>
            </button>
          </div>

          {searchTab === "region" ? (
            <form className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-in fade-in duration-200" onSubmit={handleRegionSubmit}>
              <CustomDropdown
                label="시/도 선택"
                value={selectedProvince}
                options={provinces}
                onChange={(val) => {
                  setSelectedProvince(val);
                  setSelectedDistrict("");
                }}
                placeholder="시/도 - 대분류"
                icon={MapPin}
              />

              <CustomDropdown
                label="시/군/구 선택"
                value={selectedDistrict}
                options={districts}
                onChange={(val) => setSelectedDistrict(val)}
                disabled={!selectedProvince}
                placeholder="시/군/구 - 중분류"
                icon={Compass}
              />

              <div className="w-full">
                <Button type="submit" disabled={!selectedProvince || !selectedDistrict} className="h-12 w-full shadow-lg shadow-indigo-500/10 rounded-2xl font-bold flex items-center justify-center gap-1.5">
                  <Search className="w-4 h-4" /> 지역 검색
                </Button>
              </div>
            </form>
          ) : (
            <form className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-in fade-in duration-200" onSubmit={handleRegionSubmit}>
              <div className="md:col-span-2 w-full">
                <CustomDropdown
                  label="지하철역 선택"
                  value={selectedSubway ? `${selectedSubway.name} (${selectedSubway.line}) - ${selectedSubway.province} ${selectedSubway.district}` : ""}
                  options={subwayStations.map(s => `${s.name} (${s.line}) - ${s.province} ${s.district}`)}
                  onChange={(val) => {
                    const station = subwayStations.find(s => `${s.name} (${s.line}) - ${s.province} ${s.district}` === val);
                    if (station) {
                      setSelectedSubway(station);
                      setCustomCenter([station.lat, station.lon]);
                      setSelectedProvince(station.province);
                      setSelectedDistrict(station.district);
                    } else {
                      setSelectedSubway(null);
                      setCustomCenter(null);
                    }
                  }}
                  placeholder="지하철역 선택"
                  icon={Train}
                />
              </div>

              <div className="w-full">
                <Button type="submit" disabled={!selectedSubway} className="h-12 w-full shadow-lg shadow-indigo-500/10 rounded-2xl font-bold flex items-center justify-center gap-1.5">
                  <Search className="w-4 h-4" /> 지역 검색
                </Button>
              </div>
            </form>
          )}

          {searchTab === "subway" && selectedSubway && (
            <div className="mt-4 flex items-center gap-2 px-4.5 py-3 rounded-2xl bg-indigo-50/60 border border-indigo-100/50 text-indigo-800 text-xs font-black animate-in fade-in duration-200">
              <span className="flex h-2 w-2 rounded-full bg-indigo-650 animate-ping" />
              <span>선택된 지하철역:</span>
              <span className="text-indigo-900 underline font-extrabold">{selectedSubway.name}</span>
              <span className="text-indigo-500 font-semibold">({selectedSubway.line}) 기준 반경 3km 내 탐색</span>
            </div>
          )}
        </div>

        {!showRecommendations && (
          <section className="space-y-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  지정 구역 명소 리스트
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {submittedRegion
                    ? `${submittedRegion.province} ${submittedRegion.district} 닻내리기 후보 명소들`
                    : "닻을 내릴 지역을 먼저 설정해주세요."}
                </p>
              </div>
            </div>

            {submittedRegion && (
              <div className="space-y-4 w-full">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setAppliedKeyword(filterInput);
                  }}
                  className="w-full bg-white/85 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:shadow-[0_8px_30px_rgba(99,102,241,0.08)] focus-within:border-indigo-200 transition-all duration-300 flex items-center gap-3"
                >
                  <Search className="text-slate-450 w-5 h-5 shrink-0" />
                  <input
                    type="text"
                    placeholder="찾으시는 매장 이름을 입력해 보세요 (예: 스타벅스)"
                    value={filterInput}
                    onChange={(e) => setFilterInput(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none text-slate-800 font-semibold placeholder-slate-400/80"
                  />
                  {filterInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterInput("");
                        setAppliedKeyword("");
                      }}
                      className="text-slate-450 hover:text-slate-600 text-xs font-bold p-1.5 rounded-lg hover:bg-slate-100/80 transition cursor-pointer"
                    >
                      초기화
                    </button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    className="rounded-xl font-bold shrink-0 shadow-md shadow-indigo-100"
                  >
                    검색
                  </Button>
                </form>

                <div className="mt-1">
                  <PlaceFilterChips
                    selectedFilter={selectedFilter}
                    onSelectFilter={setSelectedFilter}
                  />
                </div>
              </div>
            )}

            <AsyncStateView
              isLoading={isLoading || (isFetching && !isFetchingNextPage)}
              isError={isError}
              isEmpty={Boolean(submittedRegion && displayPlaces.length === 0)}
              loadingMessage="명소 리스트를 불러오는 중입니다..."
              emptyTitle="검색 결과가 없습니다."
              emptyDescription={placeMasters.length === 0 ? "해당 구역에 등록된 명소 정보가 아직 없습니다." : "해당 카테고리에 속하는 명소가 없습니다."}
            >
              <div className="space-y-4">
                <ul className="space-y-3.5">
                  {displayPlaces.map((placeMaster: PlaceMasterSearchResponse) => (
                    <PlaceMasterListItem
                      key={placeMaster.id}
                      placeMaster={placeMaster}
                    />
                  ))}
                </ul>

                {hasNextPage && (
                  <div className="flex justify-center pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="px-8 h-11 rounded-2xl text-xs font-bold shadow-sm"
                    >
                      {isFetchingNextPage ? "불러오는 중..." : "명소 더보기"}
                    </Button>
                  </div>
                )}
              </div>
            </AsyncStateView>
          </section>
        )}

        {submittedRegion && !showRecommendations && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
            <Button
              size="lg"
              className="shadow-2xl h-14 px-8 rounded-full text-base font-bold gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 active:scale-95 transition-all duration-300 flex items-center"
              onClick={() => setShowRecommendations(true)}
            >
              <Anchor className="w-5 h-5 stroke-[2.5px]" /> {selectedSubway ? `"${selectedSubway.name}"에 닻 내리기` : `"${submittedRegion.district}" 구역에 닻 내리기`}
            </Button>
          </div>
        )}

        {showRecommendations && (
          <section className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-indigo-650 font-bold text-xs tracking-widest uppercase flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" /> Recommendations
                </span>
                <h2 className="text-3xl font-black text-slate-900 mt-1">
                  {selectedSubway ? `"${selectedSubway.name}" 주변 추천` : `"${submittedRegion?.province} ${submittedRegion?.district}" 주변 추천`}
                </h2>
                <p className="text-slate-500 mt-1 text-sm font-medium">평점 높은 순으로 카테고리별 상위 10개 장소를 추천합니다.</p>
              </div>
              <Button variant="secondary" className="rounded-2xl flex items-center gap-1.5" onClick={() => setShowRecommendations(false)}>
                <ArrowLeft className="w-4 h-4" /> {selectedSubway ? "지하철역 다시 선택" : "구역 다시 선택"}
              </Button>
            </div>

            <AsyncStateView
              isLoading={isRecommending || (!customCenter && !regionCenter)}
              isError={false}
              isEmpty={!recommendations}
              loadingMessage="닻내리기 중심 좌표 분석 및 추천 명소를 큐레이션하고 있습니다..."
            >
              {recommendations ? (
                <RecommendationSection recommendations={recommendations} />
              ) : null}
            </AsyncStateView>

            <div className="pt-12 flex flex-col items-center gap-4">
              <Button 
                size="lg" 
                className="w-full max-w-md h-16 text-lg font-black rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                onClick={() => {
                  if (!isLoggedIn) {
                    setIsLoginGuideOpen(true);
                  } else {
                    const todayStr = getTodayString();
                    setAnchorTitle(selectedSubway 
                      ? `${todayStr} ${selectedSubway.name} 닻` 
                      : `${todayStr} ${submittedRegion?.province} ${submittedRegion?.district} 닻`);
                    setIsTitleModalOpen(true);
                  }
                }}
                isLoading={creatingAnchor}
              >
                <Anchor className="w-5 h-5 stroke-[2.5px]" /> {selectedSubway ? "이 지하철역으로 확정하기" : "이 지역으로 확정하기"}
              </Button>
              <p className="text-xs text-slate-450 font-semibold flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> {selectedSubway ? "선택한 지하철역 좌표를 기준으로 나만의 닻이 생성됩니다." : "선택한 지역의 지리적 중심을 기준으로 나만의 닻이 생성됩니다."}
              </p>
            </div>
          </section>
        )}
      </section>

      {/* Anchor Title Modal Overlay */}
      {isTitleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 bg-white shadow-2xl rounded-3xl border border-slate-200/50 relative">
            <button
              onClick={() => setIsTitleModalOpen(false)}
              className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 pr-6">
              <Anchor className="w-5 h-5 text-indigo-600 shrink-0" /> 새로운 닻의 이름 정하기
            </h3>
            <p className="text-xs font-semibold text-slate-450 mt-1">
              이 닻을 부를 나만의 이름을 입력해 주세요.
            </p>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={anchorTitle}
                onChange={(e) => setAnchorTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-white text-slate-800 font-bold"
                placeholder="예: 우리 동네 아지트 닻"
                maxLength={50}
                required
              />

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsTitleModalOpen(false)}
                  className="rounded-xl h-10 px-4 text-xs font-bold"
                  disabled={creatingAnchor}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  onClick={() => handleCreateAnchor(anchorTitle)}
                  className="rounded-xl h-10 px-5 text-xs font-bold shadow-lg shadow-indigo-600/15"
                  disabled={creatingAnchor || !anchorTitle.trim()}
                >
                  닻 내리기
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      {/* Scroll to Top Floating Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-[170px] z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-slate-200/60 text-indigo-650 shadow-xl shadow-indigo-500/5 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
          aria-label="맨 위로 이동"
        >
          <ArrowUp className="w-4 h-4 text-indigo-600 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </button>
      )}
      <LoginGuideModal isOpen={isLoginGuideOpen} onClose={() => setIsLoginGuideOpen(false)} />
    </MainLayout>
  );
}
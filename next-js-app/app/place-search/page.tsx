"use client";

import { useEffect, useState } from "react";

import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/common/Button";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { PlaceSearchForm } from "@/components/place-search/PlaceSearchForm";
import { PlaceFilterChips } from "@/components/place-search/PlaceFilterChips";
import { PlaceListItem } from "@/components/place-search/PlaceListItem";
import { usePlaceSearch } from "@/hooks/usePlaceSearch";
import { getProvinces, getDistricts } from "@/services/placeMasterService";
import { MapPin, Compass, Search, RefreshCw } from "lucide-react";

const PAGE_SIZE = 10;

const FILTER_TO_CATEGORY: Record<string, string> = {
  "맛집": "FOOD",
  "카페": "CAFE",
  "술집": "BAR",
  "숙소": "STAY",
  "놀거리": "PLAY",
};

const SORT_OPTIONS = [
  { key: "RATING", label: "평점순" },
  { key: "REVIEW_COUNT", label: "리뷰순" },
  { key: "DISTANCE", label: "거리순" },
] as const;

interface CustomDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
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
        <span className="truncate flex items-center gap-2">
          <IconComponent className={`w-4 h-4 shrink-0 ${value ? "text-indigo-650" : "text-slate-400"}`} />
          {value ? (
            <span className="text-slate-800 font-extrabold truncate">{value}</span>
          ) : (
            <span className="text-slate-450 font-semibold truncate">{placeholder}</span>
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
          <div className="absolute top-full left-0 right-0 mt-2.5 z-50 max-h-60 overflow-y-auto rounded-3xl border border-slate-200/60 bg-white/95 backdrop-blur-xl p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="flex w-full items-center rounded-xl px-4 py-2.5 text-xs font-black text-slate-400 hover:bg-slate-50 hover:text-slate-650 transition cursor-pointer"
            >
              전체보기
            </button>
            {options.map((opt) => (
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
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function PlacesPage() {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("전체");

  // Region Filters
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  // Sort Filter
  const [sortType, setSortType] = useState<"LATEST" | "NAME" | "REVIEW_COUNT" | "RATING" | "DISTANCE">("RATING");
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    getProvinces().then(setProvinces).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      getDistricts(selectedProvince).then(setDistricts).catch(console.error);
    } else {
      setDistricts([]);
    }
    setSelectedDistrict("");
    setPage(0);
  }, [selectedProvince]);

  const { data, isLoading, isError } = usePlaceSearch({
    keyword,
    ctprvnNm: selectedProvince || undefined,
    signguNm: selectedDistrict || undefined,
    category: selectedFilter !== "전체" ? FILTER_TO_CATEGORY[selectedFilter] : undefined,
    sortType,
    lat: sortType === "DISTANCE" ? userCoords?.lat : undefined,
    lon: sortType === "DISTANCE" ? userCoords?.lon : undefined,
    page,
    size: PAGE_SIZE,
  });

  const handleSortChange = (newSort: "LATEST" | "NAME" | "REVIEW_COUNT" | "RATING" | "DISTANCE") => {
    if (newSort === "DISTANCE") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserCoords({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
            setSortType("DISTANCE");
            setPage(0);
          },
          (error) => {
            console.error("Error getting location: ", error);
            alert("거리순으로 정렬하려면 위치 정보 제공 권한이 필요합니다.");
          }
        );
      } else {
        alert("이 브라우저에서는 위치 정보(Geolocation)를 지원하지 않습니다.");
      }
    } else {
      setSortType(newSort);
      setPage(0);
    }
  };

  function handleSearch(nextKeyword: string) {
    setKeyword(nextKeyword.trim());
    setPage(0);
    setSelectedFilter("전체");
  }

  function handlePreviousPage() {
    setPage((currentPage) => Math.max(currentPage - 1, 0));
  }

  function handleNextPage() {
    if (!data || data.last) {
      return;
    }

    setPage((currentPage) => currentPage + 1);
  }

  const displayPlaces = data ? data.content : [];

  return (
    <MainLayout requireAuth>
      <section className="space-y-8">
        <div className="relative z-40 rounded-[2rem] border border-white/80 bg-white/60 backdrop-blur-xl p-8 md:p-10 shadow-[0_30px_100px_rgba(99,102,241,0.06)]">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest flex items-center gap-1">
            <Search className="w-3.5 h-3.5 text-blue-500" /> Place Search
          </span>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
            장소탐색
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-xl font-semibold">
            장소명, 지역을 탐색하여 DATT가 큐레이션한 매력적인 닻 후보지들을 편리하게 찾아보세요.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-3">
              <PlaceSearchForm onSearch={handleSearch} />
            </div>

            <CustomDropdown
              label="시/도 선택"
              value={selectedProvince}
              options={provinces}
              onChange={setSelectedProvince}
              placeholder="시/도 선택"
              icon={MapPin}
            />

            <CustomDropdown
              label="시/군/구 선택"
              value={selectedDistrict}
              options={districts}
              onChange={(val) => {
                setSelectedDistrict(val);
                setPage(0);
              }}
              disabled={!selectedProvince}
              placeholder="시/군/구 선택"
              icon={Compass}
            />

            <div className="relative w-full">
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  정렬 기준
                </label>
                {(selectedProvince || selectedDistrict) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProvince("");
                      setSelectedDistrict("");
                    }}
                    className="text-indigo-655 hover:text-indigo-500 text-[10px] font-extrabold hover:underline transition cursor-pointer flex items-center gap-0.5"
                  >
                    <RefreshCw className="w-3 h-3" /> 필터 초기화
                  </button>
                )}
              </div>
              
              <div className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-100/60 p-1 shadow-inner">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSortChange(opt.key)}
                    className={`flex-1 h-full rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                      sortType === opt.key
                        ? "bg-white text-indigo-650 shadow-md shadow-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <PlaceFilterChips 
              selectedFilter={selectedFilter} 
              onSelectFilter={(filter) => {
                setSelectedFilter(filter);
                setPage(0);
              }} 
              className="max-w-none"
            />
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {keyword ? `"${keyword}" 검색 결과` : "전체 핫플레이스 목록"}
            </h2>

            <p className="text-sm font-semibold text-slate-400">
              {data
                ? `${displayPlaces.length.toLocaleString()}개 노출됨 (총 ${data.totalElements.toLocaleString()}개)`
                : "불러오는 중..."}
            </p>
          </div>

          <AsyncStateView
            isLoading={isLoading}
            isError={isError}
            isEmpty={Boolean(data?.empty)}
            loadingMessage="장소를 검색하는 중입니다..."
            errorTitle="장소 검색 실패"
            errorMessage="장소 검색 중 문제가 발생했습니다."
            emptyTitle="검색 결과가 없습니다."
            emptyDescription="다른 키워드로 다시 검색해보세요."
          >
            {data && (
              <>
                {displayPlaces.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-semibold bg-white/50 backdrop-blur-sm rounded-[2rem] border border-slate-200/40">
                    현재 페이지 내에 해당 카테고리의 장소가 없습니다.
                  </div>
                ) : (
                  <ul className="overflow-hidden rounded-[2rem] border border-slate-200/50 bg-white divide-y divide-slate-100">
                    {displayPlaces.map((place) => (
                      <PlaceListItem key={place.id} place={place} userCoords={userCoords} />
                    ))}
                  </ul>
                )}

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs font-extrabold text-slate-450">
                    총 {data.totalElements.toLocaleString()}개 중 {(data.number * PAGE_SIZE) + 1} - {Math.min((data.number + 1) * PAGE_SIZE, data.totalElements)}개 표시 (총 {data.totalPages} 페이지)
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handlePreviousPage}
                      disabled={data.first}
                      className="px-3.5 h-10 rounded-xl text-xs font-black border border-slate-200 bg-white/80 text-slate-700 shadow-sm transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 cursor-pointer"
                    >
                      이전
                    </button>

                    {(() => {
                      const current = data.number;
                      const total = data.totalPages;
                      const size = 5;
                      let start = Math.max(0, current - Math.floor(size / 2));
                      let end = Math.min(total - 1, start + size - 1);
                      if (end - start + 1 < size) {
                        start = Math.max(0, end - size + 1);
                      }
                      const pages = [];
                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }
                      return pages.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 rounded-xl text-xs font-extrabold transition active:scale-95 cursor-pointer flex items-center justify-center ${
                            p === current
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-black border border-indigo-600"
                              : "border border-slate-200 bg-white hover:bg-slate-550/10 text-slate-700"
                          }`}
                        >
                          {p + 1}
                        </button>
                      ));
                    })()}

                    <button
                      type="button"
                      onClick={handleNextPage}
                      disabled={data.last}
                      className="px-3.5 h-10 rounded-xl text-xs font-black border border-slate-200 bg-white/80 text-slate-700 shadow-sm transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 cursor-pointer"
                    >
                      다음
                    </button>
                  </div>
                </div>
              </>
            )}
          </AsyncStateView>
        </section>
      </section>
    </MainLayout>
  );
}
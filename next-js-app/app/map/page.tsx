"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { MainLayout } from "@/layouts/MainLayout";

import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";

import { MapContainer } from "@/components/map/MapContainer";
import { PlaceListItem } from "@/components/place-search/PlaceListItem";

import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { PlaceFilterChips } from "@/components/place-search/PlaceFilterChips";
import { Navigation, X, MapPin } from "lucide-react";

import type {
  PlaceSearchResponse,
} from "@/types/place";

const DEFAULT_LAT = 37.5665;
const DEFAULT_LON = 126.9780;

const FILTER_TO_CATEGORY: Record<string, string> = {
  "맛집": "FOOD",
  "카페": "CAFE",
  "술집": "BAR",
  "숙소": "STAY",
  "놀거리": "PLAY",
};

export default function MapPage() {
  const [currentLat, setCurrentLat] = useState<number>();
  const [currentLon, setCurrentLon] = useState<number>();
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResponse | null>(null);
  const [mapCenterTrigger, setMapCenterTrigger] = useState(0);
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "name">("distance");
  const [selectedFilter, setSelectedFilter] = useState<string>("전체");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      const defaultCoords = { lat: DEFAULT_LAT, lon: DEFAULT_LON };
      setCurrentLat(defaultCoords.lat);
      setCurrentLon(defaultCoords.lon);
      setGpsCoords(defaultCoords);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lon: position.coords.longitude };
        setCurrentLat(coords.lat);
        setCurrentLon(coords.lon);
        setGpsCoords(coords);
      },
      () => {
        const defaultCoords = { lat: DEFAULT_LAT, lon: DEFAULT_LON };
        setCurrentLat(defaultCoords.lat);
        setCurrentLon(defaultCoords.lon);
        setGpsCoords(defaultCoords);
      },
    );
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const kakao = (window as any).kakao;
    if (!kakao || !kakao.maps || !kakao.maps.services) {
      alert("지도 라이브러리가 로드되는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(searchQuery, (data: any[], status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        const firstMatch = data[0];
        const lat = parseFloat(firstMatch.y);
        const lon = parseFloat(firstMatch.x);
        setCurrentLat(lat);
        setCurrentLon(lon);
        setMapCenterTrigger((prev) => prev + 1);
        setSelectedPlace(null);
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert(`'${searchQuery}'에 대한 검색 결과가 없습니다.`);
      } else {
        alert("검색 중 오류가 발생했습니다.");
      }
    });
  };

  const handleGoToMyLocation = () => {
    if (gpsCoords) {
      setCurrentLat(gpsCoords.lat);
      setCurrentLon(gpsCoords.lon);
      setMapCenterTrigger((prev) => prev + 1);
      setSelectedPlace(null);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lon: position.coords.longitude };
          setGpsCoords(coords);
          setCurrentLat(coords.lat);
          setCurrentLon(coords.lon);
          setMapCenterTrigger((prev) => prev + 1);
          setSelectedPlace(null);
        },
        () => {
          setCurrentLat(DEFAULT_LAT);
          setCurrentLon(DEFAULT_LON);
          setMapCenterTrigger((prev) => prev + 1);
          setSelectedPlace(null);
        }
      );
    }
  };

  const {
    data,
    isLoading,
    isError,
  } = useNearbyPlaces({
    lat: currentLat,
    lon: currentLon,
    radiusKm: 3,
    category: selectedFilter !== "전체" ? FILTER_TO_CATEGORY[selectedFilter] : undefined,
    size: 30,
  });

  function getDistanceMeter(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371000;
    const toRad = (value: number) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDistance(meter: number) {
    if (meter < 1000) {
      return `약 ${Math.round(meter)}m`;
    }

    return `약 ${(meter / 1000).toFixed(1)}km`;
  }

  const places = useMemo(() => {
    if (
      currentLat === undefined ||
      currentLon === undefined
    ) {
      return data?.content ?? [];
    }

    const content = [...(data?.content ?? [])];

    if (sortBy === "distance") {
      return content.sort((a, b) => {
        const distanceA = getDistanceMeter(
          currentLat,
          currentLon,
          a.lat,
          a.lon,
        );

        const distanceB = getDistanceMeter(
          currentLat,
          currentLon,
          b.lat,
          b.lon,
        );

        return distanceA - distanceB;
      });
    }

    if (sortBy === "rating") {
      return content.sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        return b.reviewCount - a.reviewCount;
      });
    }

    return content.sort((a, b) =>
      a.bizesNm.localeCompare(
        b.bizesNm,
        "ko",
      ),
    );
  }, [
    data,
    sortBy,
    currentLat,
    currentLon,
  ]);

  if (
    currentLat === undefined ||
    currentLon === undefined
  ) {
    return (
      <MainLayout requireAuth>
        <LoadingState message="현재 위치를 불러오는 중입니다..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout requireAuth>
      <section className="relative flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-170px)] min-h-0 lg:overflow-hidden w-full">
        {/* Left Sidebar List */}
        <section className={`transition-all duration-300 ease-in-out h-[400px] lg:h-full min-h-0 shrink-0 ${isSidebarOpen ? "w-full lg:w-[420px] opacity-100" : "w-0 lg:w-0 overflow-hidden opacity-0 pointer-events-none"}`}>
          <div className="rounded-[2rem] border border-white/85 bg-white/60 backdrop-blur-xl p-6 shadow-[0_30px_100px_rgba(59,130,246,0.06)] flex flex-col gap-4 h-full min-h-0">
            <div>
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> Location Search
              </p>

              <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                위치탐색
              </h1>
              
              <p className="mt-1.5 text-sm text-slate-500 font-semibold leading-relaxed">
                현재 내 위치 주변의 트렌디한 핫플레이스를 실시간 지도로 탐색하세요. 마커를 누르면 상세 페이지로 연결됩니다.
              </p>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleSearch} className="relative flex gap-2 pt-2 border-t border-slate-100/70">
              <input
                type="text"
                placeholder="주소, 동명 또는 지하철역 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-12 px-4 rounded-2xl border border-slate-200 bg-white/80 focus:bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-inner"
              />
              <button
                type="submit"
                className="h-12 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
              >
                검색
              </button>
            </form>

            <div className="flex items-center justify-between gap-2 border-t border-slate-100/70 pt-3">
              <button
                type="button"
                onClick={handleGoToMyLocation}
                className="h-11 rounded-2xl border border-blue-200 bg-blue-50/70 px-4 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-100 transition active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Navigation className="w-4 h-4 fill-blue-700 text-blue-700" /> 내 위치로
              </button>

              <div className="flex h-11 items-center rounded-2xl bg-slate-100/60 p-1 border border-slate-200/50 backdrop-blur-sm shadow-inner shrink-0">
                <button
                  type="button"
                  onClick={() => setSortBy("distance")}
                  className={`rounded-xl px-3.5 h-full text-sm font-extrabold transition-all duration-300 cursor-pointer active:scale-95 flex items-center justify-center ${
                    sortBy === "distance"
                      ? "bg-white text-blue-600 shadow-md shadow-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  거리순
                </button>

                <button
                  type="button"
                  onClick={() => setSortBy("rating")}
                  className={`rounded-xl px-3.5 h-full text-sm font-extrabold transition-all duration-300 cursor-pointer active:scale-95 flex items-center justify-center ${
                    sortBy === "rating"
                      ? "bg-white text-blue-600 shadow-md shadow-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  평점순
                </button>

                <button
                  type="button"
                  onClick={() => setSortBy("name")}
                  className={`rounded-xl px-3.5 h-full text-sm font-extrabold transition-all duration-300 cursor-pointer active:scale-95 flex items-center justify-center ${
                    sortBy === "name"
                      ? "bg-white text-blue-600 shadow-md shadow-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  이름순
                </button>
              </div>
            </div>

            <div className="mt-1 shrink-0">
              <PlaceFilterChips
                selectedFilter={selectedFilter}
                onSelectFilter={setSelectedFilter}
              />
            </div>

            {isLoading && (
              <LoadingState message="주변 장소를 불러오는 중입니다..." />
            )}

            {isError && (
              <ErrorState
                title="주변 장소 조회 실패"
                message="주변 장소 정보를 불러오지 못했습니다."
              />
            )}

            {!isLoading &&
              !isError &&
              places.length === 0 && (
                <div className="rounded-[2rem] border border-slate-200/50 bg-white p-8 text-center shadow-sm">
                  <p className="text-sm font-semibold text-slate-500">
                    주변 장소가 없습니다.
                  </p>
                </div>
              )}

            {!isLoading &&
              !isError &&
              places.length > 0 && (
                <ul className="flex-1 overflow-y-auto overflow-x-hidden rounded-[2rem] p-1.5 space-y-3 pr-1">
                  {places.map((place) => (
                    <PlaceListItem
                      key={place.id}
                      place={place}
                      isSelected={selectedPlace?.id === place.id}
                      onClick={() => setSelectedPlace(place)}
                    />
                  ))}
                </ul>
              )}
          </div>
        </section>

        {/* Right Sticky Map */}
        <section className="flex-1 h-[400px] sm:h-[450px] lg:h-full overflow-hidden rounded-[2rem] border border-white/85 shadow-[0_30px_80px_rgba(0,0,0,0.03)] relative min-w-0 shrink-0 lg:shrink">
          <MapContainer
            places={places}
            selectedPlace={selectedPlace}
            currentLat={currentLat}
            currentLon={currentLon}
            centerTrigger={mapCenterTrigger}
            onSelectPlace={setSelectedPlace}
          />

          {selectedPlace && (
            <div className="absolute bottom-6 left-6 right-6 z-10 rounded-[2rem] border border-white bg-white/90 backdrop-blur-xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-300 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-100">
                    {selectedPlace.indsMclsNm || "장소"}
                  </span>

                  <h2 className="mt-1.5 text-lg font-black text-slate-900">
                    <Link
                      href={`/place-search/${selectedPlace.id}`}
                      className="hover:text-blue-600 hover:underline transition-colors duration-200"
                    >
                      {selectedPlace.bizesNm}
                    </Link>
                    {selectedPlace.brchNm && (
                      <span className="ml-1.5 text-xs font-semibold text-slate-400">
                        {selectedPlace.brchNm}
                      </span>
                    )}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedPlace(null)}
                  className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-slate-700 bg-slate-100/50 hover:bg-slate-100 rounded-full transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-semibold text-slate-500">
                <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">도로명주소</p>
                  <p className="text-slate-800 font-black text-sm leading-normal truncate">{selectedPlace.rdnmAdr || "-"}</p>
                </div>

                <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">지번주소</p>
                  <p className="text-slate-800 font-black text-sm leading-normal truncate">
                    {selectedPlace.ctprvnNm} {selectedPlace.signguNm} {selectedPlace.adongNm}
                  </p>
                </div>

                <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">남은 거리</p>
                  <p className="text-blue-600 font-black text-base">
                    {formatDistance(
                      getDistanceMeter(
                        currentLat,
                        currentLon,
                        selectedPlace.lat,
                        selectedPlace.lon,
                      ),
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </section>
    </MainLayout>
  );
}
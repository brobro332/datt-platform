"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BookmarkFolderModal } from "@/components/bookmark/BookmarkFolderModal";
import { env } from "@/lib/env";
import { apiClient } from "@/lib/apiClient";

import { MainLayout } from "@/layouts/MainLayout";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { ReviewListSection } from "@/components/review/ReviewListSection";

import { usePlaceDetail } from "@/hooks/usePlaceDetail";
import {
  useAddPlaceBookmark,
  useRemovePlaceBookmark,
} from "@/hooks/usePlaceBookmark";
import { ReviewCreateForm } from "@/components/review/ReviewCreateForm";
import { usePlaceReviews } from "@/hooks/usePlaceReviews";
import { useAuthStore } from "@/stores/authStore";

import { getCategoryFromText, getPlaceholderDetails, type PlaceCategory } from "@/utils/category";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { 
  ChevronLeft, 
  ChevronRight, 
  FolderOpen, 
  Tag, 
  Sparkles, 
  MapPin, 
  Bookmark, 
  Star, 
  MessageSquare, 
  Anchor, 
  Utensils, 
  Coffee, 
  Beer, 
  Hotel, 
  Activity,
  Search
} from "lucide-react";

const CATEGORY_ICONS: Record<PlaceCategory, React.ComponentType<{ className?: string }>> = {
  FOOD: Utensils,
  CAFE: Coffee,
  BAR: Beer,
  STAY: Hotel,
  PLAY: Activity,
  OTHER: Sparkles,
};

export default function PlaceDetailPage() {
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLocationError(null);
        },
        (err) => {
          console.log("Failed to get location", err);
          let errMsg = "위치 확인 불가";
          if (err.code === err.PERMISSION_DENIED) {
            errMsg = "위치 권한 필요";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errMsg = "위치 정보 없음";
          } else if (err.code === err.TIMEOUT) {
            errMsg = "위치 측정 시간 초과";
          }
          setLocationError(errMsg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("지원하지 않는 브라우저");
    }
  }, []);

  function getDistanceMeter(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000;
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDistance(meter: number) {
    if (meter < 1000) {
      return `약 ${Math.round(meter)}m`;
    }
    return `약 ${(meter / 1000).toFixed(1)}km`;
  }
  
  const params = useParams();
  const placeId = Number(params.placeId);

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [brokenImages, setBrokenImages] = useState<string[]>([]);
  const [placeImgError, setPlaceImgError] = useState(false);

  const handleImageError = async (failedUrl: string) => {
    setBrokenImages((prev) => [...prev, failedUrl]);
    setCurrentImageIndex(0);
    try {
      await apiClient.post("/api/files/report-broken", { imageUrl: failedUrl });
    } catch (err) {
      console.error("Failed to report broken image URL:", err);
    }
  };

  const {
    data: place,
    isLoading,
    isError,
  } = usePlaceDetail(placeId);

  const { data: reviewsData } = usePlaceReviews(placeId);
  const { member } = useAuthStore();

  const reviewImages = (reviewsData?.content
    .map((r) => r.imageUrl)
    .filter((url): url is string => typeof url === "string" && url.length > 0) ?? [])
    .filter((url) => !brokenImages.includes(url));

  const hasWrittenReview = member && reviewsData?.content.some((r) => r.memberId === member.memberId);

  const addBookmarkMutation = useAddPlaceBookmark(placeId);
  const removeBookmarkMutation = useRemovePlaceBookmark(placeId);

  const isBookmarkLoading =
    addBookmarkMutation.isPending || removeBookmarkMutation.isPending;

  function handleToggleBookmark() {
    setIsFolderModalOpen(true);
  }

  async function handleSelectFolders(folderIds: number[]) {
    await addBookmarkMutation.mutateAsync(folderIds);
  }

  async function handleUnsave() {
    await removeBookmarkMutation.mutateAsync();
    setIsFolderModalOpen(false);
  }

  useEffect(() => {
    if (!place) return;

    function createDetailMap() {
      if (!place) return;
      const container = document.getElementById("detail-static-map");
      if (!container) return;

      const position = new (window as any).kakao.maps.LatLng(place.lat, place.lon);
      const mapOptions = {
        center: position,
        level: 3,
      };

      const map = new (window as any).kakao.maps.Map(container, mapOptions);

      const marker = new (window as any).kakao.maps.Marker({
        position: position,
      });
      marker.setMap(map);
    }

    if ((window as any).kakao?.maps) {
      (window as any).kakao.maps.load(createDetailMap);
    } else {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${env.kakaoMapAppKey}&autoload=false`;
      script.async = true;
      script.onload = () => {
        (window as any).kakao.maps.load(createDetailMap);
      };
      document.head.appendChild(script);
    }
  }, [place]);

  return (
    <MainLayout>
      {isLoading && (
        <LoadingState message="장소 정보를 불러오는 중입니다..." />
      )}

      {isError && (
        <ErrorState
          title="장소 상세 조회 실패"
          message="장소 정보를 불러오지 못했습니다."
        />
      )}

      {place && (
        <section className="space-y-6">
          {/* Place Banner Image / Placeholder / Carousel */}
          <div className="relative h-64 w-full overflow-hidden rounded-[2rem] border border-slate-200/50 shadow-sm bg-white group">
            {reviewImages.length > 0 ? (
              <>
                {/* Image Slide */}
                <img
                  src={reviewImages[currentImageIndex]}
                  alt={`${place.bizesNm} 이미지 ${currentImageIndex + 1}`}
                  className="h-full w-full object-cover transition-all duration-500 ease-in-out"
                  onError={() => handleImageError(reviewImages[currentImageIndex])}
                />

                {/* Overlay Gradient for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Carousel Navigation Arrows */}
                {reviewImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev === 0 ? reviewImages.length - 1 : prev - 1));
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur-md text-slate-700 shadow-sm hover:bg-white transition cursor-pointer opacity-0 group-hover:opacity-100 duration-200"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev === reviewImages.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur-md text-slate-700 shadow-sm hover:bg-white transition cursor-pointer opacity-0 group-hover:opacity-100 duration-200"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Bottom Indicators/Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {reviewImages.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`h-1.5 rounded-full transition-all duration-250 cursor-pointer ${
                            currentImageIndex === idx ? "w-5 bg-white shadow-sm" : "w-1.5 bg-white/50 hover:bg-white/80"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (place.imageUrl && !placeImgError) ? (
              <img
                src={place.imageUrl}
                alt={place.bizesNm}
                className="h-full w-full object-cover"
                onError={() => setPlaceImgError(true)}
              />
            ) : (
              (() => {
                const cat = getCategoryFromText(place.indsMclsNm, place.indsSclsNm);
                const placeholder = getPlaceholderDetails(cat);
                const Icon = CATEGORY_ICONS[cat] || MapPin;
                return (
                  <div className={`h-full w-full bg-gradient-to-br ${placeholder.gradient} flex flex-col items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_100%)] pointer-events-none" />
                    
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/40 shadow-sm backdrop-blur-md text-slate-600 animate-float">
                      <Icon className="w-10 h-10 stroke-[2px]" />
                    </div>
                    
                    <div className="mt-4 rounded-xl bg-slate-900/5 px-3 py-1 text-xs font-bold text-slate-500 tracking-wide backdrop-blur-sm">
                      {placeholder.label}
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          <Card className="p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
              <div>
                {/* Category Badges / Classification Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <CategoryBadge category={getCategoryFromText(place.indsMclsNm, place.indsSclsNm)} />
                  <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-750 flex items-center gap-1">
                    <FolderOpen className="w-3 h-3 text-indigo-600" /> {place.indsLclsNm}
                  </span>
                  <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-[10px] font-black text-teal-750 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-teal-600" /> {place.indsMclsNm}
                  </span>
                  <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-[10px] font-black text-purple-750 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-650" /> {place.indsSclsNm}
                  </span>
                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                  {place.bizesNm}
                  {place.brchNm && (
                    <span className="ml-2 text-lg font-bold text-slate-400">
                      {place.brchNm}
                    </span>
                  )}
                </h1>

                {/* Unified Single-Line Address Bar */}
                <p className="mt-4 text-xs font-semibold text-slate-500 flex items-center gap-1.5 flex-wrap">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{place.ctprvnNm} {place.signguNm} {place.adongNm}</span>
                  <span className="text-slate-200">|</span>
                  <span className="text-slate-800 font-bold">{place.rdnmAdr || place.lnoAdr || "주소 정보 없음"}</span>
                  {place.newZipcd && (
                    <>
                      <span className="text-slate-200">|</span>
                      <span className="text-slate-400">우편번호: {place.newZipcd}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 shrink-0 w-full md:w-auto">
                <a
                  href={`https://search.naver.com/search.naver?query=${encodeURIComponent(`${place.signguNm || place.ctprvnNm} ${place.bizesNm}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 h-11 px-4.5 rounded-2xl bg-[#03c75a] hover:bg-[#02b350] text-white text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer w-full md:w-auto text-center"
                >
                  <Search className="w-3.5 h-3.5" />
                  네이버 검색
                </a>

                <Button
                  type="button"
                  variant={place.isBookmarked ? "secondary" : "primary"}
                  disabled={isBookmarkLoading}
                  onClick={handleToggleBookmark}
                  className="flex items-center justify-center gap-1.5 rounded-2xl w-full md:w-auto h-11"
                >
                  <Bookmark className={`w-4 h-4 ${place.isBookmarked ? "fill-slate-600" : ""}`} />
                  {isBookmarkLoading
                    ? "처리 중..."
                    : place.isBookmarked
                      ? "저장됨"
                      : "저장하기"}
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="flex items-center justify-between border-l-4 border-l-amber-500 p-5 bg-white/80">
              <div>
                <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">
                  평균 평점
                </p>
                <p className="mt-1.5 text-2xl font-black text-slate-900 flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" /> {place.averageRating.toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-amber-100 fill-amber-100" />
            </Card>

            <Card className="flex items-center justify-between border-l-4 border-l-indigo-500 p-5 bg-white/80">
              <div>
                <p className="text-xs font-bold text-slate-455 uppercase tracking-wider">
                  등록된 리뷰
                </p>
                <p className="mt-1.5 text-2xl font-black text-slate-900 flex items-center gap-1">
                  <MessageSquare className="w-5 h-5 text-indigo-600" /> {place.reviewCount.toLocaleString()}개
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-indigo-100 fill-indigo-100" />
            </Card>

            <Card className="flex items-center justify-between border-l-4 border-l-sky-500 p-5 bg-white/80">
              <div>
                <p className="text-xs font-bold text-slate-455 uppercase tracking-wider">
                  내 위치와의 거리
                </p>
                <p className="mt-1.5 text-2xl font-black text-slate-900 truncate max-w-[180px] flex items-center gap-1">
                  <MapPin className="w-5 h-5 text-sky-500" />
                  {userCoords 
                    ? formatDistance(getDistanceMeter(userCoords.lat, userCoords.lon, place.lat, place.lon)) 
                    : locationError || "위치 확인 중..."}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-sky-100 fill-sky-100" />
            </Card>
          </div>

          {/* 위치 지도 Card */}
          <Card className="p-0 overflow-hidden relative border border-slate-200/50 bg-white/70 backdrop-blur-md shadow-sm rounded-[2rem] h-[250px] w-full">
            <div className="absolute top-4 left-4 z-10 bg-slate-900/80 text-white text-[10px] font-black tracking-wide px-3 py-1 rounded-xl flex items-center gap-1.5 backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5 text-blue-400 stroke-[2.5px]" />
              <span>위치 정보</span>
            </div>
            <div id="detail-static-map" className="w-full h-full" />
          </Card>

          {!member ? (
            <Card className="p-6 border border-slate-200/50 bg-white/70 backdrop-blur-md text-center shadow-sm flex items-center justify-center gap-2 text-slate-500 font-bold text-sm">
              <Anchor className="w-4 h-4 text-slate-400" /> 로그인한 선원만 리뷰를 작성할 수 있습니다.
            </Card>
          ) : hasWrittenReview ? (
            <Card className="p-6 border border-slate-200/50 bg-white/70 backdrop-blur-md text-center shadow-sm flex items-center justify-center gap-2 text-slate-500 font-bold text-sm">
              <Anchor className="w-4 h-4 text-slate-400" /> 이미 리뷰를 남기셨습니다.
            </Card>
          ) : (
            <ReviewCreateForm placeId={placeId} />
          )}

          <ReviewListSection placeId={placeId} />

          <BookmarkFolderModal
            isOpen={isFolderModalOpen}
            onClose={() => setIsFolderModalOpen(false)}
            placeId={placeId}
            isBookmarked={place.isBookmarked}
            currentFolders={place.bookmarkFolders}
            onSelectFolders={handleSelectFolders}
            onUnsave={handleUnsave}
            isActionLoading={isBookmarkLoading}
          />
        </section>
      )}
    </MainLayout>
  );
}
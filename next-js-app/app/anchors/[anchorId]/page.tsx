"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { env } from "@/lib/env";

import { MainLayout } from "@/layouts/MainLayout";
import { Card } from "@/components/common/Card";
import { LoginGuideModal } from "@/components/common/LoginGuideModal";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";

import { useAnchorDetail } from "@/hooks/useAnchorDetail";
import { getCategoryFromText, type PlaceCategory } from "@/utils/category";
import { PlaceThumbnail } from "@/components/common/PlaceThumbnail";
import type { AnchorPlaceCategory, AnchorPlaceResponse, AnchorDetailResponse } from "@/types/anchor";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { deleteAnchor, changeAnchorVisibility, changeAnchorTitle, likeAnchor, unlikeAnchor, updateAnchorPlaces } from "@/services/anchorService";
import { searchPlaceMasters } from "@/services/placeMasterService";
import type { PlaceMasterSearchResponse } from "@/types/placeMaster";
import type { PlaceNearbyResponse } from "@/types/place";
import { 
  Anchor, 
  Share2, 
  Trash2, 
  Eye, 
  Heart, 
  Compass, 
  MapPin, 
  Edit, 
  X, 
  Utensils, 
  Coffee, 
  Beer, 
  Hotel, 
  Activity,
  ExternalLink,
  Search,
  Loader2
} from "lucide-react";
import { CategoryBadge } from "@/components/common/CategoryBadge";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ALL: Anchor,
  FOOD: Utensils,
  CAFE: Coffee,
  BAR: Beer,
  STAY: Hotel,
  PLAY: Activity,
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

export default function AnchorDetailPage() {
  const params = useParams();
  const anchorId = Number(params.anchorId);
  const queryClient = useQueryClient();

  const {
    data: anchor,
    isLoading,
    isError,
    refetch,
  } = useAnchorDetail(anchorId);

  const router = useRouter();
  const { member } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [isLoginGuideOpen, setIsLoginGuideOpen] = useState(false);

  const [isEditingPlaces, setIsEditingPlaces] = useState(false);
  const [excludedPlaceIds, setExcludedPlaceIds] = useState<number[]>([]);
  const [replacedPlaces, setReplacedPlaces] = useState<Record<number, PlaceNearbyResponse>>({});
  const [isSavingPlaces, setIsSavingPlaces] = useState(false);

  // Modal State for search replacement
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replacingInfo, setReplacingInfo] = useState<{ oldPlaceId: number; category: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceMasterSearchResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Reset edit states when exit edit mode or anchor loads
  useEffect(() => {
    setExcludedPlaceIds([]);
    setReplacedPlaces({});
  }, [isEditingPlaces, anchor]);

  const parseRegionFromAddress = (address: string | null) => {
    if (!address) return { province: "", district: "" };
    const parts = address.split(/\s+/);
    if (parts.length < 2) return { province: parts[0] || "", district: "" };
    const province = parts[0];
    let district = parts[1];
    if (parts.length >= 3 && (district.endsWith("시") || district.endsWith("군")) && parts[2].endsWith("구")) {
      district = `${district} ${parts[2]}`;
    }
    return { province, district };
  };

  const handleOpenReplace = (oldPlaceId: number, category: string) => {
    setReplacingInfo({ oldPlaceId, category });
    setSearchQuery("");
    setSearchResults([]);
    setIsModalOpen(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !anchor) return;

    const { province, district } = parseRegionFromAddress(anchor.baseAddress);

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
    if (!replacingInfo || !anchor) return;

    const distance = calculateDistanceKm(
      anchor.baseLat || 0,
      anchor.baseLon || 0,
      selectedPlace.lat,
      selectedPlace.lon
    );

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

    setReplacedPlaces((prev) => ({
      ...prev,
      [replacingInfo.oldPlaceId]: mappedPlace,
    }));
    setIsModalOpen(false);
  };

  const handleUpdatePlaces = async () => {
    if (!anchor) return;

    try {
      setIsSavingPlaces(true);
      const finalPlaceIds: number[] = [];
      
      const allPlacesFlat = anchor.placeGroups.reduce<AnchorPlaceResponse[]>((acc, group) => {
        return [...acc, ...group.places];
      }, []);

      allPlacesFlat.forEach((place) => {
        if (excludedPlaceIds.includes(place.placeId)) {
          return;
        }
        if (replacedPlaces[place.placeId]) {
          finalPlaceIds.push(replacedPlaces[place.placeId].id);
        } else {
          finalPlaceIds.push(place.placeId);
        }
      });

      await updateAnchorPlaces(anchorId, finalPlaceIds);
      setIsEditingPlaces(false);
      refetch();
      alert("닻 명소가 성공적으로 수정되었습니다.");
    } catch (err) {
      console.error("Failed to update anchor places", err);
      alert("명소 수정에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSavingPlaces(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 닻을 삭제하시겠습니까?")) return;
    try {
      setIsDeleting(true);
      await deleteAnchor(anchorId);
      alert("닻이 삭제되었습니다.");
      router.push("/my/profile");
    } catch (err) {
      console.error(err);
      alert("삭제에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!anchor) return;
    const nextIsPublic = !anchor.isPublic;
    try {
      setIsTogglingVisibility(true);
      await changeAnchorVisibility(anchorId, nextIsPublic);
      refetch();
    } catch (err) {
      console.error(err);
      alert("상태 전환에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  const handleSaveTitle = async () => {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      alert("닻 제목을 입력해 주세요.");
      return;
    }
    try {
      setIsSavingTitle(true);
      await changeAnchorTitle(anchorId, trimmed);
      setIsEditingTitle(false);
      refetch();
    } catch (err) {
      console.error(err);
      alert("제목 수정에 실패했습니다.");
    } finally {
      setIsSavingTitle(false);
    }
  };

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const initKakao = () => {
    if (typeof window !== "undefined") {
      const Kakao = (window as any).Kakao;
      if (Kakao) {
        if (!Kakao.isInitialized()) {
          Kakao.init(env.kakaoMapAppKey);
        }
        return Kakao;
      }
    }
    return null;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!(window as any).Kakao) {
        const script = document.createElement("script");
        script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
        script.async = true;
        script.onload = () => {
          initKakao();
        };
        document.head.appendChild(script);
      } else {
        initKakao();
      }
    }
  }, []);

  const shareToKakao = () => {
    const Kakao = initKakao();
    if (Kakao && Kakao.Share) {
      try {
        Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: anchor?.title || "DATT 닻 공유",
            description: "선원들과 함께하는 맛집/핫플레이스 탐색! 완벽한 데일리 플랜 DATT 닻을 확인해 보세요.",
            imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=60",
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
          buttons: [
            {
              title: "닻 탐색하기",
              link: {
                mobileWebUrl: window.location.href,
                webUrl: window.location.href,
              },
            },
          ],
        });
        setIsShareModalOpen(false);
      } catch (err) {
        console.error("Kakao share failed:", err);
        alert("카카오톡 공유에 실패했습니다. 링크 복사를 이용해 주세요.");
      }
    } else {
      alert("카카오톡 SDK 로딩 중입니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const shareNative = async () => {
    const shareData = {
      title: anchor?.title || "DATT 닻 공유",
      text: `닻 "${anchor?.title || '정보'}" 정보를 확인하고 함께 정박해 보세요!`,
      url: window.location.href,
    };
    try {
      await navigator.share(shareData);
      setIsShareModalOpen(false);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Native share failed:", err);
      }
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("닻 주소가 클립보드에 복사되었습니다! 선원들에게 공유해 보세요.");
      setIsShareModalOpen(false);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      alert("링크 복사에 실패했습니다. 주소창의 링크를 직접 복사해 주세요.");
    }
  };

  const [isLiking, setIsLiking] = useState(false);

  const handleToggleLike = async () => {
    if (!member) {
      setIsLoginGuideOpen(true);
      return;
    }
    if (!anchor || isLiking) return;

    try {
      setIsLiking(true);
      const nextLiked = !anchor.isLiked;
      if (anchor.isLiked) {
        await unlikeAnchor(anchorId);
      } else {
        await likeAnchor(anchorId);
      }

      queryClient.setQueryData<AnchorDetailResponse>(
        ["anchor", anchorId],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            isLiked: nextLiked,
            likeCount: nextLiked ? oldData.likeCount + 1 : Math.max(oldData.likeCount - 1, 0)
          };
        }
      );
    } catch (err) {
      console.error(err);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLiking(false);
    }
  };

  const isOwner = member && anchor && member.memberId === anchor.memberId;

  // Active tab state: 'ALL' | AnchorPlaceCategory
  const [activeTab, setActiveTab] = useState<"ALL" | AnchorPlaceCategory>("ALL");

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="닻 정보를 불러오는 중입니다..." />
      </MainLayout>
    );
  }

  if (isError || !anchor) {
    return (
      <MainLayout>
        <ErrorState
          title="닻 상세 조회 실패"
          message="닻 정보를 불러오지 못했습니다."
        />
      </MainLayout>
    );
  }

  // Flatten all places inside the anchor
  const allPlaces = anchor.placeGroups.reduce<AnchorPlaceResponse[]>((acc, group) => {
    return [...acc, ...group.places];
  }, []);

  // Sort by recommend order
  const sortedAllPlaces = [...allPlaces].sort((a, b) => a.recommendOrder - b.recommendOrder);

  // Filter places based on activeTab
  const displayPlaces = activeTab === "ALL"
    ? sortedAllPlaces
    : anchor.placeGroups.find(g => g.category === activeTab)?.places ?? [];

  const tabs: { key: "ALL" | AnchorPlaceCategory; label: string; count: number; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "ALL", label: "전체", count: allPlaces.length, icon: Anchor },
    { key: "FOOD", label: "맛집", count: anchor.placeGroups.find(g => g.category === "FOOD")?.places.length ?? 0, icon: Utensils },
    { key: "CAFE", label: "카페", count: anchor.placeGroups.find(g => g.category === "CAFE")?.places.length ?? 0, icon: Coffee },
    { key: "BAR", label: "술집", count: anchor.placeGroups.find(g => g.category === "BAR")?.places.length ?? 0, icon: Beer },
    { key: "STAY", label: "숙소", count: anchor.placeGroups.find(g => g.category === "STAY")?.places.length ?? 0, icon: Hotel },
    { key: "PLAY", label: "놀거리", count: anchor.placeGroups.find(g => g.category === "PLAY")?.places.length ?? 0, icon: Activity },
  ];

  return (
    <MainLayout>
      <section className="space-y-8 pb-32">
        {!member && (
          <div className="rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-500 p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 animate-fadeIn border border-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_100%)] pointer-events-none" />
            <div className="space-y-1 text-center md:text-left z-10">
              <h3 className="text-lg font-black flex items-center justify-center md:justify-start gap-1.5">
                <Anchor className="w-5 h-5 stroke-[2.5px]" /> DATT에 오신 것을 환영합니다!
              </h3>
              <p className="text-xs font-medium text-indigo-100">
                다른 선원이 제작한 특별한 정박 코스입니다. 나만의 정박 지도를 꾸미고 기록을 남기려면 선원으로 합류해 보세요!
              </p>
            </div>
          </div>
        )}

        {/* Anchor Header Card */}
        <div className="rounded-[2.5rem] border border-slate-200/50 bg-white/70 backdrop-blur-md p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-indigo-200/20 blur-2xl pointer-events-none" />
          
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-indigo-650 uppercase tracking-widest flex items-center gap-1">
                <Anchor className="w-3.5 h-3.5" /> 닻 리포트
              </p>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2 w-full max-w-md">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-xl text-base outline-none focus:border-indigo-500 bg-white font-extrabold text-slate-800"
                      maxLength={50}
                    />
                    <button
                      onClick={handleSaveTitle}
                      disabled={isSavingTitle || !newTitle.trim()}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition active:scale-95 cursor-pointer"
                    >
                      {isSavingTitle ? "저장중" : "저장"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingTitle(false);
                        setNewTitle(anchor.title);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-655 text-xs font-bold hover:bg-slate-200 transition active:scale-95 cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{anchor.title}</span>
                    {isOwner && (
                      <button
                        onClick={() => {
                          setNewTitle(anchor.title);
                          setIsEditingTitle(true);
                        }}
                        className="text-slate-400 hover:text-indigo-655 transition text-sm cursor-pointer p-1 rounded-lg hover:bg-slate-150"
                        title="제목 수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </h1>

              <div className="space-y-1.5 pt-2">
                <p className="text-sm font-extrabold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> 기준 지역: <span className="text-slate-900 font-black">{anchor.basePlaceName ?? "지정 주소 기준"}</span>
                </p>
                <p className="text-xs font-semibold text-slate-400 pl-5.5">
                  도로명 주소: {anchor.baseAddress ?? "주소 정보 없음"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Visibility Toggle Switch (Owner Only) */}
              {isOwner ? (
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 px-3.5 py-1.5 rounded-xl shadow-sm">
                  <span className="text-xs font-extrabold text-slate-600 select-none">
                    {anchor.isPublic ? "🌐 공개" : "🔒 비공개"}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleVisibility}
                    disabled={isTogglingVisibility}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      anchor.isPublic ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        anchor.isPublic ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ) : (
                <span className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold shadow-sm ${
                  anchor.isPublic 
                    ? "bg-emerald-50 border-emerald-200/50 text-emerald-700" 
                    : "bg-slate-50 border-slate-200/50 text-slate-500"
                }`}>
                  {anchor.isPublic ? "공개" : "비공개"}
                </span>
              )}

              {/* Share Button (All Users) */}
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="rounded-xl border border-indigo-250 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 shadow-sm hover:bg-indigo-100 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> 공유
              </button>

              {/* Edit Places Button (Owner Only) */}
              {isOwner && (
                isEditingPlaces ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleUpdatePlaces}
                      disabled={isSavingPlaces}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSavingPlaces ? "저장 중..." : "저장"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingPlaces(false)}
                      className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingPlaces(true)}
                    className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 shadow-sm hover:bg-indigo-100 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" /> 수정
                  </button>
                )
              )}

              {/* Delete Button (Owner Only) */}
              {isOwner && !isEditingPlaces && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 shadow-sm hover:bg-rose-100 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {isDeleting ? "삭제 중..." : "삭제"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-3">
          <Card className="p-5 flex items-center justify-between border-l-4 border-l-indigo-400 bg-white/80">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                조회수
              </p>
              <p className="mt-1 text-2xl font-black text-slate-800 flex items-center gap-1">
                <Eye className="w-5 h-5 text-indigo-650" /> {anchor.viewCount.toLocaleString()}회
              </p>
            </div>
            <Eye className="w-8 h-8 text-indigo-100 fill-indigo-100" />
          </Card>

          <Card 
            onClick={handleToggleLike}
            className={`p-5 flex items-center justify-between border-l-4 border-l-rose-450 transition-all duration-200 active:scale-95 cursor-pointer select-none hover:shadow-md group relative overflow-hidden bg-white/80 ${
              anchor.isLiked 
                ? "bg-rose-50/40 border-rose-250 hover:bg-rose-50/70" 
                : "hover:bg-rose-50/10 hover:border-l-rose-500"
            }`}
          >
            <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

            <div className="relative z-10">
              <p className="text-[10px] font-extrabold text-rose-650 uppercase tracking-wider flex items-center gap-1">
                {anchor.isLiked ? "❤️ 추천 완료" : "🤍 추천하기"}
              </p>
              <p className="mt-0.5 text-2xl font-black text-slate-800 flex items-center gap-1.5">
                {anchor.likeCount.toLocaleString()}개
              </p>
              <span className="text-[10px] text-slate-400 font-bold group-hover:text-rose-600 transition-colors duration-200">
                {anchor.isLiked ? "클릭해서 취소" : "클릭해서 추천"}
              </span>
            </div>
            <Heart className={`w-8 h-8 relative z-10 transition-transform duration-300 ${anchor.isLiked ? "text-rose-500 fill-rose-500" : "text-rose-200"} ${isLiking ? "animate-spin" : "group-hover:scale-120 group-hover:rotate-12"}`} />
          </Card>

          <Card className="p-5 flex items-center justify-between border-l-4 border-l-amber-400 bg-white/80">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                탐색 반경
              </p>
              <p className="mt-1 text-2xl font-black text-slate-800 flex items-center gap-1">
                <Compass className="w-5 h-5 text-amber-500" /> {anchor.radiusKm ?? "-"}km
              </p>
            </div>
            <Compass className="w-8 h-8 text-amber-100 fill-amber-100" />
          </Card>
        </div>

        {/* Tab layout selector */}
        <section className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5">
                <Anchor className="w-5 h-5 text-indigo-650" /> 닻내리기 추천 명소 리스트
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                이 지역을 기준으로 DATT 선장들이 엄선한 핫플레이스를 카테고리별로 확인해 보세요.
              </p>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100/70 border border-slate-200/50 backdrop-blur-sm">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.key;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 ${
                    isSelected
                      ? "bg-white text-indigo-700 shadow-sm border border-slate-200/30"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  }`}
                >
                  <TabIcon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                    isSelected 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "bg-slate-200/60 text-slate-500"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Recommended places list grid */}
          {displayPlaces.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-bold bg-white/50 backdrop-blur-sm rounded-[2rem] border border-slate-200/40">
              해당 지역 내에 이 카테고리의 명소가 아직 없습니다.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {displayPlaces.map((place) => {
                const cat = place.category || getCategoryFromText(place.indsMclsNm, "");
                const isExcluded = excludedPlaceIds.includes(place.placeId);
                const displayPlace = replacedPlaces[place.placeId] 
                  ? {
                      placeId: replacedPlaces[place.placeId].id,
                      bizesNm: replacedPlaces[place.placeId].bizesNm,
                      brchNm: replacedPlaces[place.placeId].brchNm,
                      indsMclsNm: replacedPlaces[place.placeId].indsMclsNm,
                      rdnmAdr: replacedPlaces[place.placeId].rdnmAdr,
                      distanceKm: replacedPlaces[place.placeId].distanceKm,
                      category: cat,
                    }
                  : place;

                return (
                  <Card 
                    key={place.placeId} 
                    className={`p-5 flex items-center gap-4 hover:shadow-md transition-all duration-300 group border bg-white/80 backdrop-blur-sm ${
                      isExcluded 
                        ? "opacity-50 border-slate-200 bg-slate-50/50" 
                        : "border-slate-200/50"
                    }`}
                  >
                    <PlaceThumbnail placeId={displayPlace.placeId} indsMclsNm={displayPlace.indsMclsNm} category={displayPlace.category} className="h-16 w-16 rounded-2xl" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <CategoryBadge category={cat as PlaceCategory} />
                        <span className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-450">
                          {displayPlace.indsMclsNm}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
                          <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {displayPlace.distanceKm.toFixed(2)}km 거리
                        </span>
                      </div>

                      <h3 className="truncate text-base font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {displayPlace.bizesNm}
                        {displayPlace.brchNm && (
                          <span className="ml-1 text-xs font-semibold text-slate-400">
                            {displayPlace.brchNm}
                          </span>
                        )}
                      </h3>

                      <p className="mt-0.5 truncate text-xs font-semibold text-slate-400 flex items-center gap-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {displayPlace.rdnmAdr}
                      </p>
                    </div>

                    {isEditingPlaces ? (
                      <div className="flex gap-1.5 shrink-0 ml-2">
                        {isExcluded ? (
                          <button
                            type="button"
                            onClick={() => setExcludedPlaceIds((prev) => prev.filter((id) => id !== place.placeId))}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-xs font-bold transition cursor-pointer"
                          >
                            복구
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenReplace(place.placeId, cat)}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-350 bg-white text-slate-550 text-xs font-bold transition cursor-pointer"
                            >
                              교체
                            </button>
                            <button
                              type="button"
                              onClick={() => setExcludedPlaceIds((prev) => [...prev, place.placeId])}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-655 text-xs font-bold transition cursor-pointer"
                            >
                              제외
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={`/place-search/${displayPlace.placeId}`}
                        className="shrink-0 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white shadow-sm transition-all duration-200 hover:border-indigo-500 hover:text-indigo-600 active:scale-95 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> 상세
                      </Link>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </section>

      {isShareModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-slate-200/60 p-8 shadow-[0_30px_70px_rgba(15,23,42,0.18)] relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient background glows */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
            
            <div className="flex flex-col items-center text-center mb-6">
              {/* Glowing Share Icon Area */}
              <div className="relative mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 shadow-inner">
                <Share2 className="w-6 h-6 text-indigo-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">닻 공유하기</h3>
              <p className="text-xs font-semibold text-slate-450 mt-1 select-none">
                이 멋진 코스를 선원들에게 소문내 보세요!
              </p>
            </div>

            <div className="space-y-3.5">
              {/* Kakao Share */}
              <button
                onClick={shareToKakao}
                className="w-full py-4 rounded-2xl bg-[#FEE500] hover:bg-[#FEE500]/95 text-[#191919] font-black text-sm transition-all duration-200 active:scale-98 cursor-pointer flex items-center justify-center gap-2.5 shadow-md shadow-[#FEE500]/15 hover:shadow-[#FEE500]/25"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.316 6.09-.176.65-.632 2.333-.724 2.7-.114.455.163.45.342.33 1.4-.937 4.31-2.937 4.776-3.254.434.057.876.087 1.29.087 4.97 0 9-3.185 9-7.115C21 6.185 16.97 3 12 3z"/>
                </svg>
                카카오톡 공유하기
              </button>

              {/* Native Web Share (Conditional) */}
              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <button
                  onClick={shareNative}
                  className="w-full py-4 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-black text-sm transition-all duration-200 active:scale-98 cursor-pointer flex items-center justify-center gap-2.5 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                  모바일 기기 공유하기
                </button>
              )}

              {/* Copy Link */}
              <button
                onClick={copyLink}
                className="w-full py-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-sm transition-all duration-200 active:scale-98 cursor-pointer flex items-center justify-center gap-2.5 shadow-sm"
              >
                <svg className="w-4 h-4 text-slate-450" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                링크 복사하기
              </button>
            </div>

            <button
              onClick={() => setIsShareModalOpen(false)}
              className="mt-6 w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition cursor-pointer select-none"
            >
              닫기
            </button>
          </div>
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
            {anchor && (() => {
              const { province, district } = parseRegionFromAddress(anchor.baseAddress);
              return (
                <p className="text-xs font-semibold text-slate-450 mt-1">
                  이 지역 상권({province} {district}) 내의 다른 매장을 검색하여 추천 목록의 매장과 교체할 수 있습니다.
                </p>
              );
            })()}

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
      <LoginGuideModal isOpen={isLoginGuideOpen} onClose={() => setIsLoginGuideOpen(false)} />
    </MainLayout>
  );
}
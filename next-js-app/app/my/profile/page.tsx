"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { MainLayout } from "@/layouts/MainLayout";
import { Card } from "@/components/common/Card";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";

import { useMyProfile } from "@/hooks/useMyProfile";
import { useMyTitles } from "@/hooks/useMyTitles";
import { useSelectMyTitle } from "@/hooks/useTitleMutation";
import { useMyAchievements } from "@/hooks/useMyAchievements";
import { ActivityLogSection } from "@/components/activity/ActivityLogSection";
import { useRouter } from "next/navigation";
import { updateNickname, withdrawMember } from "@/services/memberService";
import { useAuthStore } from "@/stores/authStore";
import { 
  Crown, 
  Mail, 
  Bookmark, 
  MessageSquare, 
  Anchor, 
  Heart, 
  Compass, 
  MapPin, 
  Star, 
  Trophy, 
  Lock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const ITEMS_PER_PAGE = 4;

export default function MyProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useMyProfile();
  const { data: titles = [] } = useMyTitles();
  const { data: achievements = [] } = useMyAchievements();
  const selectTitleMutation = useSelectMyTitle();

  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editNicknameVal, setEditNicknameVal] = useState("");
  const [editError, setEditError] = useState("");
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const updateStoreNickname = useAuthStore((state) => state.updateNickname);

  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await withdrawMember();
      logout();
      router.replace("/");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "회원 탈퇴에 실패했습니다. 다시 시도해 주세요.");
      setIsWithdrawing(false);
      setShowWithdrawConfirm(false);
    }
  };

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNicknameVal.trim()) {
      setEditError("닉네임을 입력해 주세요.");
      return;
    }
    if (editNicknameVal.trim() === profile?.nickname) {
      setIsEditingNickname(false);
      return;
    }

    setIsSavingNickname(true);
    setEditError("");
    try {
      await updateNickname(editNicknameVal.trim());
      updateStoreNickname(editNicknameVal.trim());
      refetch();
      setIsEditingNickname(false);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "이미 사용 중인 닉네임이거나 수정에 실패했습니다.";
      setEditError(msg);
    } finally {
      setIsSavingNickname(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"titles" | "achievements">("titles");
  const [titleNotice, setTitleNotice] = useState<string | null>(null);

  // Pagination states
  const [titlesPage, setTitlesPage] = useState(0);
  const [achievementsPage, setAchievementsPage] = useState(0);

  // Auto-clear notification after 3 seconds
  useEffect(() => {
    if (titleNotice) {
      const timer = setTimeout(() => setTitleNotice(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [titleNotice]);

  if (isLoading) {
    return (
      <MainLayout requireAuth>
        <LoadingState message="프로필 정보를 불러오는 중입니다..." />
      </MainLayout>
    );
  }

  if (isError || !profile) {
    return (
      <MainLayout requireAuth>
        <ErrorState
          title="프로필 조회 실패"
          message="프로필 정보를 불러오지 못했습니다."
        />
      </MainLayout>
    );
  }

  const progressPercent =
    profile.requiredExpForNextLevel > 0
      ? Math.min(
          Math.round((profile.exp / profile.requiredExpForNextLevel) * 100),
          100
        )
      : 100;

  const remainingExp =
    profile.requiredExpForNextLevel > profile.exp
      ? profile.requiredExpForNextLevel - profile.exp
      : 0;

  const handleSelectTitle = (titleId: number, name: string) => {
    if (selectTitleMutation.isPending) return;
    selectTitleMutation.mutate(titleId, {
      onSuccess: () => {
        setTitleNotice(`대표 칭호가 "${name}"(으)로 장착되었습니다.`);
        refetch();
      },
    });
  };

  // Pagination computations
  const paginatedTitles = titles.slice(
    titlesPage * ITEMS_PER_PAGE,
    (titlesPage + 1) * ITEMS_PER_PAGE
  );
  const totalTitlesPages = Math.ceil(titles.length / ITEMS_PER_PAGE);

  const paginatedAchievements = achievements.slice(
    achievementsPage * ITEMS_PER_PAGE,
    (achievementsPage + 1) * ITEMS_PER_PAGE
  );
  const totalAchievementsPages = Math.ceil(achievements.length / ITEMS_PER_PAGE);

  return (
    <MainLayout requireAuth>
      <section className="space-y-8 pb-20 animate-in fade-in duration-500">
        
        {/* Profile Premium Light Glassmorphic Hero Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/50 bg-white/80 p-8 md:p-10 shadow-sm backdrop-blur-md">
          {/* Clean border-b that blends beautifully with the layout */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-5">
              {/* Avatar with soft glow */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 blur-sm opacity-35" />
                <div className="relative h-20 w-20 rounded-full bg-gradient-to-tr from-blue-500 via-blue-600 to-blue-700 border border-white/20 flex items-center justify-center text-3xl font-black text-white shadow-md">
                  {profile.nickname ? profile.nickname.charAt(0) : "D"}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  {isEditingNickname ? (
                    <form onSubmit={handleSaveNickname} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editNicknameVal}
                        onChange={(e) => setEditNicknameVal(e.target.value)}
                        className="px-3 py-1 text-base font-black rounded-xl border border-slate-200 bg-white/95 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner w-48"
                        placeholder="닉네임 입력"
                        disabled={isSavingNickname}
                      />
                      <button
                        type="submit"
                        disabled={isSavingNickname}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {isSavingNickname ? "저장 중" : "저장"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingNickname(false);
                          setEditError("");
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-[11px] font-bold transition shadow-sm active:scale-95 cursor-pointer"
                      >
                        취소
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-black tracking-tight text-slate-900">{profile.nickname}</h1>
                      <button
                        onClick={() => {
                          setEditNicknameVal(profile.nickname);
                          setIsEditingNickname(true);
                          setEditError("");
                        }}
                        className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition active:scale-95 cursor-pointer text-slate-400 hover:text-slate-600 flex items-center justify-center"
                        title="닉네임 수정"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {profile.selectedTitle ? (
                    <span className="rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-xs font-black text-amber-700 shadow-sm flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {profile.selectedTitle.name}
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 border border-slate-200/40 px-3.5 py-1.5 text-xs font-semibold text-slate-400">
                      대표 칭호 없음
                    </span>
                  )}
                </div>
                {editError && (
                  <p className="text-[11px] font-bold text-rose-600">{editError}</p>
                )}
                <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" /> {profile.email}
                </p>
              </div>
            </div>

            {/* Level Premium Box Accent - Legible solid styling */}
            <div className="self-start md:self-auto rounded-3xl bg-indigo-50/70 border border-indigo-100 px-8 py-5 text-center shadow-sm">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Level</p>
              <p className="mt-1 text-4xl font-black text-indigo-700 tracking-tight">
                Lv. {profile.level}
              </p>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="bg-slate-100/85 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/20">
                EXP {profile.exp.toLocaleString()} / {profile.requiredExpForNextLevel.toLocaleString()}
              </span>
              <span className="text-indigo-600 font-black">
                다음 레벨까지 {remainingExp.toLocaleString()} EXP 남음
              </span>
            </div>

            <div className="relative h-4 overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 transition-all duration-700 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-end">
              <span className="text-xs font-black text-indigo-600">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Premium Activity Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Link href="/my/bookmarks">
            <Card className="flex items-center justify-between p-6 border border-slate-100 bg-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:-translate-y-1 hover:shadow-lg hover:border-rose-200/60 transition-all duration-300">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">저장한 장소</p>
                <p className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
                  {profile.activitySummary.bookmarkCount.toLocaleString()}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50/70 text-rose-500 shadow-sm border border-rose-100/30">
                <Bookmark className="w-5 h-5" />
              </div>
            </Card>
          </Link>

          <Link href="/my/reviews">
            <Card className="flex items-center justify-between p-6 border border-slate-100 bg-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:-translate-y-1 hover:shadow-lg hover:border-teal-200/60 transition-all duration-300">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">작성한 리뷰</p>
                <p className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
                  {profile.activitySummary.reviewCount.toLocaleString()}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50/70 text-teal-500 shadow-sm border border-teal-100/30">
                <MessageSquare className="w-5 h-5" />
              </div>
            </Card>
          </Link>

          <Link href="/my/anchors">
            <Card className="flex items-center justify-between p-6 border border-slate-100 bg-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200/60 transition-all duration-300">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">생성한 닻</p>
                <p className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
                  {profile.activitySummary.anchorCount.toLocaleString()}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50/70 text-indigo-500 shadow-sm border border-indigo-100/30">
                <Anchor className="w-5 h-5" />
              </div>
            </Card>
          </Link>

          <Link href="/my/likes">
            <Card className="flex items-center justify-between p-6 border border-slate-100 bg-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:-translate-y-1 hover:shadow-lg hover:border-amber-200/60 transition-all duration-300">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">받은 좋아요</p>
                <p className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
                  {profile.activitySummary.receivedLikeCount.toLocaleString()}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50/70 text-amber-500 shadow-sm border border-amber-100/30">
                <Heart className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
            </Card>
          </Link>
        </div>

        {/* Dashboard Sections Grid - Pixel-perfect height alignment in desktop */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT: Recent Activities & Logs (8/12) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Recent Anchor, Reviews & Bookmarks Box (Height 360px) */}
            <div className="grid gap-6 md:grid-cols-3">
              
              {/* Recent Anchors */}
              <Card className="p-6 bg-white/80 border border-slate-100 flex flex-col justify-between h-[360px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
                <div className="flex flex-col h-full">
                  <div className="mb-4 flex items-center justify-between shrink-0">
                    <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Anchor className="w-4 h-4 text-indigo-600" /> 최근 생성한 닻
                    </h2>
                    <Link
                      href="/my/anchors"
                      className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                      전체 보기
                    </Link>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 min-h-0">
                    {profile.recentAnchors.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-10 gap-2">
                        <Compass className="w-8 h-8 text-slate-300" />
                        <p className="text-xs font-bold text-slate-400">아직 생성한 닻이 없습니다.</p>
                      </div>
                    ) : (
                      profile.recentAnchors.map((anchor) => (
                        <Link
                          key={anchor.anchorId}
                          href={`/anchors/${anchor.anchorId}`}
                          className="flex items-center gap-3 rounded-xl border border-slate-100/60 bg-slate-50/50 p-3 hover:border-blue-300 hover:bg-blue-50/20 transition-all duration-200"
                        >
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                            <Anchor className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-slate-900 text-xs truncate">
                              {anchor.title}
                            </p>
                            <p className="mt-0.5 text-[10px] font-medium text-slate-500 truncate flex items-center gap-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {anchor.basePlaceName || "구역 정박"}
                            </p>
                            <p className="mt-1 text-[9px] font-black text-blue-600">
                              조회 {anchor.viewCount}회
                            </p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </Card>

              {/* Recent Reviews */}
              <Card className="p-6 bg-white/80 border border-slate-100 flex flex-col justify-between h-[360px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
                <div className="flex flex-col h-full">
                  <div className="mb-4 flex items-center justify-between shrink-0">
                    <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-indigo-600" /> 최근 작성 후기
                    </h2>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      후기 {profile.activitySummary.reviewCount}개
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 min-h-0">
                    {profile.recentReviews.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-10 gap-2">
                        <MessageSquare className="w-8 h-8 text-slate-300" />
                        <p className="text-xs font-bold text-slate-400">아직 작성한 리뷰가 없습니다.</p>
                      </div>
                    ) : (
                      profile.recentReviews.map((review) => (
                        <Link
                          key={review.placeId}
                          href={`/place-search/${review.placeId}`}
                          className="block rounded-xl border border-slate-100/60 bg-slate-50/50 p-3 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
                            <p className="font-extrabold text-slate-900 text-xs truncate">
                              {review.placeName}
                            </p>
                            <span className="shrink-0 rounded-lg bg-amber-50 px-2 py-0.5 text-[9px] font-black text-amber-700 border border-amber-200/20 flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {review.rating.toFixed(1)}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-[10px] font-medium leading-normal text-slate-500">
                            {review.content}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </Card>

              {/* Recent Bookmarked Places */}
              <Card className="p-6 bg-white/80 border border-slate-100 flex flex-col justify-between h-[360px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
                <div className="flex flex-col h-full">
                  <div className="mb-4 flex items-center justify-between shrink-0">
                    <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Bookmark className="w-4 h-4 text-rose-500 animate-pulse" /> 최근 저장한 장소
                    </h2>
                    <Link
                      href="/my/bookmarks"
                      className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-xl hover:bg-rose-100 transition-colors"
                    >
                      전체 보기
                    </Link>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 min-h-0">
                    {profile.recentBookmarks.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-10 gap-2">
                        <Bookmark className="w-8 h-8 text-slate-300" />
                        <p className="text-xs font-bold text-slate-400">아직 저장한 장소가 없습니다.</p>
                      </div>
                    ) : (
                      profile.recentBookmarks.map((bookmark) => (
                        <Link
                          key={bookmark.bookmarkId}
                          href={`/place-search/${bookmark.placeId}`}
                          className="block rounded-xl border border-slate-100/60 bg-slate-50/50 p-3 hover:border-rose-300 hover:bg-rose-50/20 transition-all duration-200"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-slate-900 text-xs truncate">
                              {bookmark.bizesNm}
                            </p>
                            <p className="mt-0.5 text-[10px] font-medium text-slate-500 truncate flex items-center gap-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-450 shrink-0" /> {bookmark.ctprvnNm} {bookmark.signguNm}
                            </p>
                            <p className="mt-1 text-[9px] font-black text-rose-600">
                              {bookmark.indsMclsNm}
                            </p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </Card>

            </div>

            {/* Experience Timeline Logs (Height 360px) */}
            <Card className="p-6 bg-white/80 border border-slate-100 h-[360px] flex flex-col justify-between overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
              <ActivityLogSection />
            </Card>

          </div>

          {/* RIGHT: Interactive Titles & Achievements Locker (4/12) */}
          {/* Aligned height of 360 + 360 + 32 (gap) = 752px in large screens */}
          <div className="lg:col-span-4 w-full lg:h-[752px]">
            <Card className="p-6 bg-white/80 border border-slate-100 flex flex-col h-full overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
              
              {/* Premium Capsule Tab Navigation Header */}
              <div className="flex items-center bg-slate-100/85 p-1.5 rounded-2xl mb-5 shrink-0 border border-slate-200/10">
                <button
                  onClick={() => { setActiveTab("titles"); }}
                  className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === "titles"
                      ? "text-indigo-600 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.02)]"
                      : "text-slate-400 hover:text-slate-650"
                  }`}
                >
                  칭호 보관함 ({profile.titleCount})
                </button>
                <button
                  onClick={() => { setActiveTab("achievements"); }}
                  className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === "achievements"
                      ? "text-indigo-600 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.02)]"
                      : "text-slate-400 hover:text-slate-650"
                  }`}
                >
                  달성 업적 ({profile.achievementCount})
                </button>
              </div>

              {/* Title Update Notice Banner */}
              {titleNotice && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-250/50 text-emerald-700 text-xs font-bold text-center animate-in fade-in slide-in-from-top-1 shrink-0">
                  {titleNotice}
                </div>
              )}

              {/* Tab Content List Container */}
              <div className="flex-1 overflow-y-auto pr-0.5 space-y-3 min-h-0">
                
                {/* 1) TITLES LOCKER WITH FRONTEND PAGINATION */}
                {activeTab === "titles" && (
                  titles.length === 0 ? (
                    <div className="h-full flex items-center justify-center py-20">
                      <p className="text-xs font-semibold text-slate-400">보유한 칭호가 없습니다.</p>
                    </div>
                  ) : (
                    paginatedTitles.map((title) => (
                      <div
                        key={title.titleId}
                        onClick={() => !title.selected && handleSelectTitle(title.titleId, title.name)}
                        className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          title.selected
                            ? "border-amber-400 bg-amber-50/50"
                            : "border-slate-100 hover:bg-slate-50/70"
                        }`}
                      >
                        <div className="min-w-0 flex-1 mr-3">
                          <div className="flex items-center gap-2">
                            <Crown className={`w-4 h-4 shrink-0 ${title.selected ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
                            <span className="font-extrabold text-sm text-slate-800">
                              {title.name}
                            </span>
                            {title.selected && (
                              <span className="rounded-md bg-amber-100 border border-amber-200 px-2 py-0.5 text-[9px] font-black text-amber-700">
                                장착됨
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500 font-medium">
                            {title.description}
                          </p>
                        </div>

                        {/* Interactive Equip Button */}
                        {!title.selected && (
                          <button
                            disabled={selectTitleMutation.isPending}
                            className="h-8 px-3 shrink-0 rounded-lg text-xs font-bold text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {selectTitleMutation.isPending ? "..." : "장착"}
                          </button>
                        )}
                      </div>
                    ))
                  )
                )}

                {/* 2) ACHIEVEMENTS LOCKER WITH FRONTEND PAGINATION */}
                {activeTab === "achievements" && (
                  achievements.length === 0 ? (
                    <div className="h-full flex items-center justify-center py-20">
                      <p className="text-xs font-semibold text-slate-400">업적 데이터가 없습니다.</p>
                    </div>
                  ) : (
                    paginatedAchievements.map((ach) => (
                      <div
                        key={ach.achievementId}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                          ach.achieved
                            ? "border-emerald-500/10 bg-emerald-50/10 glow-success"
                            : "border-slate-100 opacity-60"
                        }`}
                      >
                        {/* Status visual badge */}
                        <div className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-xl shadow-sm ${
                          ach.achieved
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50"
                            : "bg-slate-50 text-slate-400 border border-slate-100/50"
                        }`}>
                          {ach.achieved ? (
                            <Trophy className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Lock className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-sm text-slate-800 truncate">
                              {ach.name}
                            </span>
                            <span className={`shrink-0 text-[10px] font-black ${
                              ach.achieved
                                ? "text-emerald-600"
                                : "text-slate-500"
                            }`}>
                              +{ach.rewardExp} EXP
                            </span>
                          </div>
                          
                          <p className="mt-1 text-[11px] text-slate-500 font-medium">
                            {ach.description}
                          </p>

                          {ach.achievedAt && (
                            <p className="mt-2 text-[9px] font-bold text-emerald-500 flex items-center gap-1">
                              <Trophy className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500 inline-block" /> 달성일: {new Date(ach.achievedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )
                )}

              </div>

              {/* PINNED PAGINATION CONTROLS (At the bottom of right card) */}
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
                {activeTab === "titles" ? (
                  <>
                    <p className="text-xs font-black text-slate-500">
                      {titlesPage + 1} / {Math.max(totalTitlesPages, 1)} 페이지
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setTitlesPage((p) => Math.max(p - 1, 0))}
                        disabled={titlesPage === 0}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-650 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setTitlesPage((p) => Math.min(p + 1, totalTitlesPages - 1))}
                        disabled={titlesPage >= totalTitlesPages - 1}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-650 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-black text-slate-500">
                      {achievementsPage + 1} / {Math.max(totalAchievementsPages, 1)} 페이지
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setAchievementsPage((p) => Math.max(p - 1, 0))}
                        disabled={achievementsPage === 0}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-650 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setAchievementsPage((p) => Math.min(p + 1, totalAchievementsPages - 1))}
                        disabled={achievementsPage >= totalAchievementsPages - 1}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-650 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>

            </Card>
          </div>

        </div>

        {/* Danger Zone */}
        <div className="rounded-[2.5rem] border border-rose-200/50 bg-rose-50/20 p-8 md:p-10 shadow-sm backdrop-blur-md mt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-xl font-black text-rose-700 tracking-tight flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-500 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Danger Zone
              </h2>
              <p className="text-sm font-semibold text-slate-500 max-w-xl leading-relaxed">
                회원 탈퇴 시 작성하신 모든 정박지 정보(닻), 리뷰, 북마크 내역 및 경험치/레벨 등의 계정 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
              </p>
            </div>

            <div className="shrink-0">
              {!showWithdrawConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowWithdrawConfirm(true)}
                  className="px-6 py-3.5 rounded-2xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-black transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  회원 탈퇴 신청
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <span className="text-xs font-black text-rose-600 self-center mb-1.5 sm:mb-0 sm:mr-2">
                    정말로 DATT를 떠나시겠습니까?
                  </span>
                  <button
                    type="button"
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isWithdrawing ? "탈퇴 처리 중" : "탈퇴 진행"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWithdrawConfirm(false)}
                    disabled={isWithdrawing}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-650 hover:bg-slate-100 text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </section>
    </MainLayout>
  );
}

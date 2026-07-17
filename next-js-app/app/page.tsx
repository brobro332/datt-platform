"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/layouts/MainLayout";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { useAuthStore } from "@/stores/authStore";
import { getPlatformStats, type PlatformStatsResponse } from "@/services/statsService";
import { UserGuideModal } from "@/components/common/UserGuideModal";
import { 
  Sparkles, 
  Anchor, 
  ArrowRight, 
  Search, 
  MapPin, 
  Trophy, 
  Star, 
  Coffee, 
  Utensils, 
  Users,
  Map,
  TrendingUp,
  HelpCircle
} from "lucide-react";

export default function HomePage() {
  const [stats, setStats] = useState<PlatformStatsResponse | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    setMounted(true);
    async function fetchStats() {
      try {
        const res = await getPlatformStats();
        setStats(res);
      } catch (err) {
        console.error(err);
      }
    }
    fetchStats();
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="grid gap-12 lg:grid-cols-12 lg:items-center py-8 md:py-16">
        <div className="lg:col-span-7 space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-4.5 py-2 text-xs font-bold text-blue-600 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Discover All The Town</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl lg:text-6xl leading-[1.12]">
            어디에 당신의 <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
              닻(DATT)
            </span>
            을 내릴까요?
          </h1>

          <p className="max-w-xl text-base md:text-lg leading-relaxed text-slate-655 font-medium font-sans">
            DATT는 특정 지역을 기준으로 나만의 닻을 내리고 맛집, 카페, 숙소, 놀거리를 한눈에 탐색하여 특별한 하루 코스를 큐레이션하는 로컬 라이프스타일 플랫폼입니다.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/place-master">
              <Button size="lg" className="shadow-lg shadow-blue-600/20 rounded-2xl glow-primary flex items-center gap-2">
                <Anchor className="w-4 h-4" /> 닻내리기
              </Button>
            </Link>
            <Button 
              variant="secondary" 
              size="lg" 
              className="rounded-2xl flex items-center gap-1.5"
              onClick={() => setIsUserGuideOpen(true)}
            >
              사용 가이드 <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="lg:col-span-5 relative animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-tr from-blue-500 to-indigo-500 opacity-10 blur-3xl pointer-events-none" />
          
          <Card className="relative overflow-hidden border border-slate-200/50 p-6 shadow-2xl max-w-sm mx-auto bg-white/90 backdrop-blur-xl rounded-[2.5rem] transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_30px_70px_rgba(59,130,246,0.12)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-100">
                  <Anchor className="w-5 h-5 stroke-[2.5px]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">마포구 상수동 닻</h4>
                  <p className="text-[10px] font-semibold text-slate-400">Created 2 hours ago</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100/50 px-3 py-1 text-[10px] font-black text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </div>

            <div className="py-5 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500 flex items-center gap-1.5"><Map className="w-3.5 h-3.5" /> 탐색 반경</span>
                <span className="font-extrabold text-slate-800 bg-slate-100/80 px-2 py-0.5 rounded-md">1.5 km</span>
              </div>
              
              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-2xl bg-white border border-slate-100 p-3 shadow-sm hover:border-blue-100 transition duration-300">
                  <div className="flex items-center gap-3">
                    <Utensils className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-black text-slate-800">라멘 베라보</span>
                  </div>
                  <span className="text-xs font-black text-blue-600 bg-blue-50/60 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-blue-600 text-blue-600" /> 4.8
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white border border-slate-100 p-3 shadow-sm hover:border-blue-100 transition duration-300">
                  <div className="flex items-center gap-3">
                    <Coffee className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-black text-slate-800">펠트커피 창전점</span>
                  </div>
                  <span className="text-xs font-black text-blue-600 bg-blue-50/60 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-blue-600 text-blue-600" /> 4.7
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] font-extrabold">
              <span className="text-slate-400 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 24명이 둘러보는 중</span>
              <span className="font-black text-blue-600 hover:text-blue-700 transition cursor-pointer flex items-center gap-0.5">자세히 보기 <ArrowRight className="w-3 h-3" /></span>
            </div>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border border-slate-200/50 bg-white/50 backdrop-blur-md rounded-[2.5rem] px-6 shadow-sm">
        <div className="text-center p-3 border-r border-slate-200/60 last:border-r-0">
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {stats ? stats.placeCount.toLocaleString() : "48K+"}
          </p>
          <p className="mt-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">등록된 장소</p>
        </div>
        <div className="text-center p-3 border-r border-slate-200/60 last:border-r-0">
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {stats ? stats.anchorCount.toLocaleString() : "1,240"}
          </p>
          <p className="mt-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">생성된 닻</p>
        </div>
        <div className="text-center p-3 border-r border-slate-200/60 last:border-r-0">
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {stats ? stats.reviewCount.toLocaleString() : "9,800"}
          </p>
          <p className="mt-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">누적 매핑 리뷰</p>
        </div>
        <div className="text-center p-3 last:border-r-0">
          <p className="text-3xl font-black text-blue-600 tracking-tight">
            {stats ? `${stats.averageRating.toFixed(1)}/5` : "4.9/5"}
          </p>
          <p className="mt-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">사용자 만족도</p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mt-24 space-y-8">
        <div className="text-center max-w-lg mx-auto space-y-3">
          <div className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            Features
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            DATT만의 차별화된 로컬 경험 탐색
          </h2>
          <p className="text-sm font-semibold text-slate-500">
            그저 장소를 나열하는 검색엔진이 아닙니다. 지역의 개성을 묶어 나만의 라이프를 완성합니다.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 pt-4">
          <Card className="hover:border-blue-250 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full p-7 bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 mb-6 shadow-sm">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">정밀 장소 검색</h3>
              <p className="mt-2.5 text-xs font-semibold leading-relaxed text-slate-500">
                필터와 키워드를 기반으로 해당 구역에 포함된 수만 개의 상권 정보 및 사용자 피드백 데이터를 정확하게 탐색합니다.
              </p>
            </div>
          </Card>

          <Card className="hover:border-blue-200 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full p-7 bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 mb-6 shadow-sm">
                <Anchor className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">경험 큐레이션</h3>
              <p className="mt-2.5 text-xs font-semibold leading-relaxed text-slate-500">
                원하는 곳에 닻을 내리면 주변 반경의 맛집, 카페, 숙소 데이터를 엄선하여 최고의 코스를 맞춤 제안받을 수 있습니다.
              </p>
            </div>
          </Card>

          <Card className="hover:border-blue-200 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full p-7 bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 mb-6 shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">사용자 성장 시스템</h3>
              <p className="mt-2.5 text-xs font-semibold leading-relaxed text-slate-500">
                리뷰 작성, 북마크 저장, 나만의 닻 생성 등의 활동으로 EXP를 획득하고 특별한 한정 칭호를 획득하는 성장 요소를 더했습니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      {mounted && !isLoggedIn && (
        <section className="mt-28 rounded-[3rem] bg-gradient-to-tr from-slate-950 via-blue-950 to-slate-900 p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl border border-blue-900/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_50%)] pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl" />
          
          <div className="relative max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl leading-snug">
              지금 첫 번째 닻을 내리고 <br />새로운 탐험을 시작하세요.
            </h2>
            <p className="text-slate-350 text-sm leading-relaxed max-w-md mx-auto font-medium">
              내 주변에서 가장 핫한 장소들을 연결하여 완벽한 데일리 플랜을 만들고 공유해보세요.
            </p>
            <div className="pt-3">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-950 hover:bg-slate-100 shadow-xl shadow-white/5 border-none rounded-2xl font-black transition-all">
                  무료로 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <UserGuideModal isOpen={isUserGuideOpen} onClose={() => setIsUserGuideOpen(false)} />
    </MainLayout>
  );
}
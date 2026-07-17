"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlobalHeader } from "@/components/common/GlobalHeader";
import { useManualStore } from "@/stores/manualStore";
import { HelpCircle, X, Anchor, Search, MapPin, Trophy } from "lucide-react";
import { adsData, AdItem } from "@/data/adsData";
import { AdBannerCard } from "@/components/common/AdBannerCard";

type MainLayoutProps = {
  children: ReactNode;
  requireAuth?: boolean;
};

export function MainLayout({ children, requireAuth = false }: MainLayoutProps) {
  const { isOpen, open, close } = useManualStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (requireAuth) {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login");
      }
    }
  }, [requireAuth, router]);

  const [leftAd, setLeftAd] = useState<AdItem | null>(null);
  const [rightAd, setRightAd] = useState<AdItem | null>(null);

  useEffect(() => {
    if (adsData.length > 0) {
      // 셔플하여 좌우 광고를 다르게 선택합니다.
      const shuffled = [...adsData].sort(() => 0.5 - Math.random());
      setLeftAd(shuffled[0] || null);
      if (shuffled.length > 1) {
        setRightAd(shuffled[1]);
      } else {
        setRightAd(shuffled[0] || null);
      }
    }
  }, []);

  if (requireAuth) {
    if (!mounted) return null;
    if (typeof window !== "undefined" && !localStorage.getItem("accessToken")) {
      return null;
    }
  }

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Premium glowing background elements */}
      <div className="fixed top-[-10%] right-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-indigo-300/30 via-violet-300/20 to-transparent blur-[130px] pointer-events-none animate-float" />
      <div className="fixed bottom-[-10%] left-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-sky-200/25 via-pink-200/15 to-transparent blur-[110px] pointer-events-none animate-float-delayed" />

      <GlobalHeader />

      <div className="relative mx-auto w-full max-w-[1780px] px-4 flex justify-center gap-8">
        {/* Left Side Ad Column */}
        {leftAd ? (
          <AdBannerCard ad={leftAd} />
        ) : (
          <div className="hidden xl:block w-[200px] shrink-0 h-[580px]" />
        )}

        {/* Center Main Content */}
        <main className="flex-1 max-w-6xl py-8 pb-28 md:py-12 min-w-0">
          {/* Mobile/Tablet/Laptop Inline Ads (Visible when screen < xl) */}
          <div className="xl:hidden w-full mb-8 grid grid-cols-2 gap-2 sm:gap-4">
            {leftAd && <AdInlineCard ad={leftAd} />}
            {rightAd && <AdInlineCard ad={rightAd} />}
          </div>

          {children}
        </main>

        {/* Right Side Ad Column */}
        {rightAd ? (
          <AdBannerCard ad={rightAd} />
        ) : (
          <div className="hidden xl:block w-[200px] shrink-0 h-[580px]" />
        )}
      </div>

      {/* Persistent Floating Guide Button */}
      <button
        onClick={open}
        className="fixed bottom-[84px] md:bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 px-5.5 py-4 text-xs font-black text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] hover:scale-105 hover:shadow-[0_10px_35px_rgba(99,102,241,0.35)] active:scale-95 transition-all duration-300 cursor-pointer"
      >
        <HelpCircle className="w-4 h-4 shrink-0" />
        <span>사용 가이드</span>
      </button>

      {/* Global User Manual Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={close} />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg rounded-[2.5rem] border border-white/50 bg-white/90 p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={close}
              className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6">
              <div className="flex items-center gap-2.5">
                <Anchor className="w-7 h-7 text-indigo-650 shrink-0" />
                <div>
                  <h3 className="text-xl font-black text-slate-900">DATT 사용법 가이드</h3>
                  <p className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest mt-0.5">Discover All The Town</p>
                </div>
              </div>

              <p className="text-sm font-semibold leading-relaxed text-slate-500">
                DATT는 특정 지역을 기준으로 나만의 닻을 내리고 맛집, 카페, 숙소, 놀거리를 한눈에 탐색하여 특별한 하루 코스를 큐레이션하는 로컬 라이프스타일 플랫폼입니다.
              </p>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {/* Section 1 */}
                <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100/30 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <Anchor className="w-4 h-4 text-indigo-600 shrink-0" /> 닻내리기
                  </h4>
                  <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-500">
                    지역(시/도, 시/군/구)을 지정해 닻을 내리면 그 주변 3km 반경 내의 핫플레이스들을 카테고리별 최고 평점 순으로 한눈에 큐레이션해 줍니다!
                  </p>
                </div>

                {/* Section 2 */}
                <div className="rounded-2xl bg-teal-50/50 border border-teal-100/30 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <Search className="w-4 h-4 text-teal-600 shrink-0" /> 장소탐색
                  </h4>
                  <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-500">
                    키워드나 카테고리 태그로 가고 싶은 장소를 검색하고, 마음에 드는 명소들은 나만의 개별 폴더를 만들어 북마크에 저장해보세요.
                  </p>
                </div>

                {/* Section 3 */}
                <div className="rounded-2xl bg-rose-50/50 border border-rose-100/30 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <MapPin className="w-4 h-4 text-rose-600 shrink-0" /> 위치탐색
                  </h4>
                  <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-500">
                    내 실시간 위치를 기반으로 지도 위에 주변 30개 명소들을 띄워 주어, 동선을 확인하고 매장의 상세 주소 및 거리를 손쉽게 알아볼 수 있습니다.
                  </p>
                </div>

                {/* Section 4 */}
                <div className="rounded-2xl bg-amber-50/50 border border-amber-100/30 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <Trophy className="w-4 h-4 text-amber-600 shrink-0" /> 게이미피케이션 및 프로필
                  </h4>
                  <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-500">
                    저장하기, 후기 작성, 닻 내리기 등 플랫폼 내 탐험 활동을 통해 경험치(EXP)를 얻고 레벨업을 하여 대표 칭호를 장착하거나 전용 메달 업적을 달성해보세요!
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={close}
                  className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition cursor-pointer"
                >
                  준비 완료, 탐험 시작하기!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdInlineCard({ ad }: { ad: AdItem }) {
  return (
    <a
      href={ad.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        window.open(ad.link, '_blank', 'width=1200,height=800,noopener,noreferrer');
      }}
      className="flex flex-col sm:flex-row items-center sm:items-stretch gap-2.5 sm:gap-4 rounded-2xl sm:rounded-3xl border border-slate-200/50 bg-white/80 p-3 sm:p-4 shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-slate-300 hover:bg-white transition-all duration-300 group overflow-hidden relative cursor-pointer min-h-[185px] sm:min-h-0 sm:h-[110px]"
    >
      {/* Thumbnail */}
      <div className="h-20 w-full sm:h-16 sm:w-16 shrink-0 rounded-xl sm:rounded-2xl overflow-hidden relative border border-slate-100/60">
        <img src={ad.images[0]} alt={ad.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
      </div>

      {/* Text Info */}
      <div className="min-w-0 flex-1 flex flex-col justify-between sm:justify-center w-full">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[8px] font-black text-white bg-slate-400 dark:bg-slate-500 px-1.5 py-0.5 rounded tracking-wider">
              AD
            </span>
            {ad.badge && (
              <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                {ad.badge}
              </span>
            )}
            <span className="text-[10px] hidden sm:inline">{ad.emoji}</span>
          </div>
          <h4 className="mt-1.5 text-[10px] sm:text-xs font-black text-slate-800 leading-snug break-all sm:truncate whitespace-normal">
            {ad.title}
          </h4>
        </div>
        <p className="mt-0.5 text-[10px] font-medium text-slate-450 truncate hidden sm:block">
          {ad.description}
        </p>
      </div>

      {/* Button */}
      <div className="shrink-0 hidden sm:block">
        <span className="inline-flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100/50 px-3 py-2 text-[10px] font-bold text-slate-650 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
          이동
        </span>
      </div>
    </a>
  );
}
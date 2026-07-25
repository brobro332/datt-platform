"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlobalHeader } from "@/components/common/GlobalHeader";
import { useManualStore } from "@/stores/manualStore";
import { HelpCircle, X, Anchor, Search, MapPin, Trophy } from "lucide-react";
import { UserGuideModal } from "@/components/common/UserGuideModal";
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
          <div className="hidden xl:block w-[200px] shrink-0 h-[540px]" />
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
          <div className="hidden xl:block w-[200px] shrink-0 h-[540px]" />
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
      <UserGuideModal isOpen={isOpen} onClose={close} />
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
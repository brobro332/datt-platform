"use client";

import { X, Anchor, MapPin, MessageSquare, FolderHeart } from "lucide-react";
import { Button } from "@/components/common/Button";

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserGuideModal({ isOpen, onClose }: UserGuideModalProps) {
  if (!isOpen) return null;

  const guides = [
    {
      icon: <Anchor className="w-5 h-5 text-blue-600" />,
      title: "1. 내 마음대로 닻내리기",
      desc: "지도에서 원하거나 자주 가는 구역(상권) 또는 지하철역을 선택하고 '닻내리기' 버튼을 누르면 나만의 중심 좌표가 콕 집어 정박합니다.",
    },
    {
      icon: <MapPin className="w-5 h-5 text-indigo-650" />,
      title: "2. 맞춤 장소 코스 추천",
      desc: "정박한 구역을 기준으로 주변의 맛집, 카페, 숙소, 놀거리 등을 종합 분석하여 엄선된 핫플레이스를 테마별 코스로 즉시 큐레이션해 줍니다.",
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-amber-500" />,
      title: "3. 선원들과 경험 공유 (리뷰)",
      desc: "장소별 방문 후기를 '리뷰 작성하기'로 남겨 소통해 보세요. 비로그인 유저도 다른 사람들이 남긴 생생한 리뷰 정보를 리다이렉트 없이 먼저 구경할 수 있습니다.",
    },
    {
      icon: <FolderHeart className="w-5 h-5 text-rose-500" />,
      title: "4. 나의 닻 & 북마크 보관함",
      desc: "만족스러운 추천지나 닻 코스는 언제든 폴더별로 북마크할 수 있습니다. 마이페이지 탭 컴포넌트에서 생성한 닻과 폴더를 한눈에 관리해 보세요.",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-slate-200/60 p-8 md:p-10 shadow-[0_30px_70px_rgba(15,23,42,0.22)] relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background ambient glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-650 transition cursor-pointer p-1.5 rounded-xl hover:bg-slate-100/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-8">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-full">
            DATT GUIDE
          </span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-3 flex items-center gap-2">
            ⚓ DATT 서비스 사용 가이드
          </h3>
          <p className="text-xs font-semibold text-slate-450 mt-1.5 leading-relaxed">
            DATT 플랫폼을 100% 마스터할 수 있는 쉽고 빠른 핵심 기능 요약 가이드입니다.
          </p>
        </div>

        {/* Modal Body - Grid Layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((guide, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-150/40 hover:bg-white hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300"
            >
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200/50 shadow-inner">
                {guide.icon}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-950 tracking-tight">
                  {guide.title}
                </h4>
                <p className="text-[11px] font-semibold text-slate-450 leading-relaxed">
                  {guide.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Button */}
        <div className="mt-8 flex justify-end">
          <Button
            type="button"
            variant="primary"
            className="w-full sm:w-auto h-11 px-8 rounded-2xl font-bold shadow-md shadow-indigo-100 text-sm flex items-center justify-center"
            onClick={onClose}
          >
            확인 및 가이드 닫기
          </Button>
        </div>
      </div>
    </div>
  );
}

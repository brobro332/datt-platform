"use client";

import { useRouter } from "next/navigation";
import { Anchor, X, Lock } from "lucide-react";
import { Button } from "@/components/common/Button";

interface LoginGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function LoginGuideModal({
  isOpen,
  onClose,
  title = "선원으로 합류해 볼까요? ⚓",
  description = "이 기능은 DATT 선원만 이용할 수 있습니다. 지금 로그인하거나 회원가입하시면 나만의 닻을 저장하고 보관할 수 있습니다.",
}: LoginGuideModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-slate-200/60 p-8 shadow-[0_30px_70px_rgba(15,23,42,0.18)] relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background ambient glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1.5 rounded-xl hover:bg-slate-100/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center text-center">
          {/* Glowing Lock Icon */}
          <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 shadow-inner">
            <Lock className="w-6 h-6 text-indigo-650 animate-pulse" />
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {title}
          </h3>

          <p className="text-xs font-semibold text-slate-450 leading-relaxed mt-2.5 max-w-xs">
            {description}
          </p>

          {/* Buttons Area */}
          <div className="mt-7 w-full space-y-2.5">
            <Button
              type="button"
              variant="primary"
              className="w-full h-11 rounded-2xl font-bold shadow-md shadow-indigo-100 text-sm flex items-center justify-center gap-1.5"
              onClick={() => {
                onClose();
                router.push("/login");
              }}
            >
              로그인하러 가기
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full h-11 rounded-2xl font-bold text-sm"
              onClick={() => {
                onClose();
                router.push("/signup");
              }}
            >
              선원으로 가입하기
            </Button>
            <button
              type="button"
              className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition cursor-pointer rounded-xl"
              onClick={onClose}
            >
              계속 둘러보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

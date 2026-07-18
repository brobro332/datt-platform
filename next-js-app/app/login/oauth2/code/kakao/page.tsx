"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSocialKakao } from "@/services/authService";
import { updateNickname } from "@/services/memberService";
import { useAuthStore } from "@/stores/authStore";
import { MainLayout } from "@/layouts/MainLayout";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import type { LoginResponse } from "@/types/auth";

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState("");
  const hasRequested = useRef(false);

  // Nickname setup states for new members
  const [isNewMember, setIsNewMember] = useState(false);
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authData, setAuthData] = useState<LoginResponse | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("인가 코드를 찾을 수 없습니다.");
      return;
    }

    if (hasRequested.current) return;
    hasRequested.current = true;

    async function handleLogin(authCode: string) {
      try {
        const response = await loginSocialKakao(authCode);

        // Save tokens immediately so they can call the update nickname API
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        if (response.isNewMember) {
          setAuthData(response);
          setNickname(response.nickname || "");
          setIsNewMember(true);
        } else {
          const member = {
            memberId: response.memberId,
            nickname: response.nickname,
            role: response.role,
          };
          localStorage.setItem("member", JSON.stringify(member));
          setAuth(response.accessToken, response.refreshToken, member);
          router.push("/");
        }
      } catch (err) {
        console.error(err);
        setError("카카오 소셜 로그인에 실패했습니다. 다시 시도해 주세요.");
      }
    }

    handleLogin(code);
  }, [searchParams, router, setAuth]);

  const handleRegisterNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setNicknameError("닉네임을 입력해 주세요.");
      return;
    }
    setIsSubmitting(true);
    setNicknameError("");
    try {
      await updateNickname(nickname.trim());

      if (authData) {
        const member = {
          memberId: authData.memberId,
          nickname: nickname.trim(),
          role: authData.role,
        };
        localStorage.setItem("member", JSON.stringify(member));
        setAuth(authData.accessToken, authData.refreshToken, member);
        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "이미 사용 중인 닉네임이거나 설정에 실패했습니다.";
      setNicknameError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isNewMember) {
    const avatarLetter = nickname.trim() ? nickname.trim().charAt(0) : "?";
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-slate-200/50 p-8 md:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.06)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Subtle Kakao theme header accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400" />
          
          {/* Ambient background glows */}
          <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
          
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            {/* Dynamic Avatar Preview */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-400 blur-sm opacity-40 animate-pulse" />
              <div className="relative h-24 w-24 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-300 border border-white flex items-center justify-center text-4xl font-black text-slate-800 shadow-md transition-transform duration-300 transform hover:scale-105">
                {avatarLetter}
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">반갑습니다! 🎉</h2>
              <p className="text-xs font-bold text-slate-450 leading-relaxed max-w-[280px]">
                DATT에서 선원들과 모험을 시작하기 전에 멋진 닉네임을 하나 설정해 주세요.
              </p>
            </div>
          </div>

          <form onSubmit={handleRegisterNickname} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">
                닉네임 설정
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={isSubmitting}
                maxLength={20}
                className="w-full px-5 py-4 text-base font-black rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:bg-white transition-all shadow-inner placeholder-slate-350"
                placeholder="2자 이상 20자 이하"
              />
              {nicknameError && (
                <p className="text-[11px] font-bold text-rose-500 mt-1.5 pl-1 flex items-center gap-1">
                  <span>⚠️</span> {nicknameError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#FEE500] hover:bg-[#FEE500]/95 text-[#191919] font-black text-sm transition-all duration-200 shadow-md shadow-[#FEE500]/15 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? "프로필 등록 중..." : "닻 올리기 ⚓"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
      {error ? (
        <div className="rounded-2xl bg-rose-50 border border-rose-200/50 p-6 text-sm font-bold text-rose-700 max-w-md text-center">
          ⚠️ {error}
          <button
            onClick={() => router.push("/login")}
            className="mt-4 block w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
          >
            로그인 화면으로 돌아가기
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-3.5">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-black text-slate-700 animate-pulse">카카오 로그인 처리 중입니다...</p>
        </div>
      )}
    </div>
  );
}

export default function KakaoCallbackPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-3.5">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-black text-slate-700 animate-pulse">로딩 중...</p>
        </div>
      }>
        <KakaoCallbackContent />
      </Suspense>
    </MainLayout>
  );
}

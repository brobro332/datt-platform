"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { login } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { env } from "@/lib/env";

import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleKakaoLogin = () => {
    const clientId = env.kakaoClientId || "YOUR_KAKAO_CLIENT_ID_PLACEHOLDER";
    const redirectUri = env.kakaoRedirectUri || `${window.location.origin}/login/oauth2/code/kakao`;
    const url = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=profile_nickname,account_email`;
    window.location.href = url;
  };



  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();

    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await login({
        email,
        password,
      });

      const member = {
        memberId: response.memberId,
        nickname: response.nickname,
      };

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("member", JSON.stringify(member));

      setAuth(response.accessToken, response.refreshToken, member);

      router.push("/");
    } catch (error) {
      console.error(error);
      setErrorMessage("이메일 또는 비밀번호를 다시 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-4xl items-center justify-center py-6">
        <div className="grid w-full overflow-hidden rounded-[2.5rem] border border-slate-200/50 bg-white/75 backdrop-blur-lg shadow-xl md:grid-cols-12">
          {/* Left Panel: Hero Story */}
          <div className="relative hidden flex-col justify-between bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 p-10 text-white md:col-span-5 md:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />
            
            <div className="relative z-10">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-lg">⚓</span>
                <span className="font-black tracking-tight text-white">DATT</span>
              </Link>
            </div>

            <div className="relative z-10 my-auto space-y-6">
              <h2 className="text-2xl font-extrabold leading-tight">
                나만의 지역에 <br />
                닻을 내리고 <br />
                새로운 탐험을 하세요.
              </h2>
              <ul className="space-y-3.5 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400">✔</span> 맛집, 카페 등 카테고리별 맞춤 코스 추천
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400">✔</span> 지도 기반으로 실시간 동선 설계
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400">✔</span> 활동 점수에 따른 레벨 및 칭호 시스템
                </li>
              </ul>
            </div>

            <div className="relative z-10 text-[10px] text-slate-400">
              © {new Date().getFullYear()} DATT. All rights reserved.
            </div>
          </div>

          {/* Right Panel: Login Form */}
          <div className="p-8 md:p-12 md:col-span-7 flex flex-col justify-center">
            <div className="mb-6">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">
                Welcome Back
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                로그인
              </h1>
              <p className="mt-1.5 text-xs text-slate-500">
                저장한 장소와 나의 Anchor를 다시 탐색해보세요.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-200/50 p-4 text-xs font-bold text-rose-700 animate-fadeIn">
                ⚠️ {errorMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                id="email"
                label="이메일 주소"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <Input
                id="password"
                label="비밀번호"
                type="password"
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <Button
                type="submit"
                className="w-full mt-2"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
            </form>

            {/* Social Logins */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="flex-shrink mx-4 text-slate-450 text-xs font-semibold select-none">또는 소셜 계정으로 로그인</span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              <div className="w-full">
                {/* Kakao Button */}
                <button
                  type="button"
                  onClick={handleKakaoLogin}
                  className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#191919] text-xs font-black shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.316 6.09-.176.65-.632 2.333-.724 2.7-.114.455.163.45.342.33 1.4-.937 4.31-2.937 4.776-3.254.434.057.876.087 1.29.087 4.97 0 9-3.185 9-7.115C21 6.185 16.97 3 12 3z"/>
                  </svg>
                  카카오 로그인
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-slate-500">
              아직 계정이 없으신가요?{" "}
              <Link
                href="/signup"
                className="font-bold text-indigo-600 hover:underline"
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
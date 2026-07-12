"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signup, checkEmail, checkNickname, sendVerificationEmail, verifyEmailCode } from "@/services/authService";
import { useEffect } from "react";

import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Label } from "@/components/common/Label";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  
  // Email verification timer states
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailVerificationMsg, setEmailVerificationMsg] = useState("");
  const [timer, setTimer] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);

  const handleVerifyCode = async () => {
    if (!email || !verificationCode || verificationCode.length !== 6) return;
    try {
      setIsCheckingCode(true);
      setErrorMessage("");
      setEmailVerificationMsg("");
      await verifyEmailCode(email, verificationCode);
      setIsEmailVerified(true);
      setIsTimerRunning(false);
      setEmailVerificationMsg("이메일 인증이 성공적으로 완료되었습니다. ✅");
    } catch (err) {
      console.error(err);
      setIsEmailVerified(false);
      setEmailVerificationMsg("인증코드가 올바르지 않거나 만료되었습니다. ❌");
    } finally {
      setIsCheckingCode(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSendVerification = async () => {
    if (!email || !isEmailChecked) return;
    try {
      setIsSendingEmail(true);
      setEmailVerificationMsg("");
      setErrorMessage("");
      await sendVerificationEmail(email);
      setIsVerificationSent(true);
      setTimer(180);
      setIsTimerRunning(true);
      setEmailVerificationMsg("이메일로 인증코드가 발송되었습니다. ✉️");
    } catch (err) {
      console.error(err);
      setEmailVerificationMsg("인증코드 발송에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Duplicate check states
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [emailCheckMsg, setEmailCheckMsg] = useState("");

  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [nicknameCheckMsg, setNicknameCheckMsg] = useState("");

  const handleCheckEmail = async () => {
    if (!email) return;
    try {
      setIsCheckingEmail(true);
      setEmailCheckMsg("");
      setErrorMessage("");
      await checkEmail(email);
      setIsEmailChecked(true);
      setEmailCheckMsg("사용 가능한 이메일입니다. ✅");
    } catch (err) {
      console.error(err);
      setIsEmailChecked(false);
      const error = err as { response?: { data?: { code?: string } } };
      const isDuplicated = error?.response?.data?.code === "member.duplicated_email";
      setEmailCheckMsg(isDuplicated ? "이미 등록된 이메일 주소입니다. ❌" : "이메일 중복 체크 실패. 다시 시도해 주세요.");
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleCheckNickname = async () => {
    if (!nickname) return;
    try {
      setIsCheckingNickname(true);
      setNicknameCheckMsg("");
      setErrorMessage("");
      await checkNickname(nickname);
      setIsNicknameChecked(true);
      setNicknameCheckMsg("사용 가능한 닉네임입니다. ✅");
    } catch (err) {
      console.error(err);
      setIsNicknameChecked(false);
      const error = err as { response?: { data?: { code?: string } } };
      const isDuplicated = error?.response?.data?.code === "member.duplicated_nickname";
      setNicknameCheckMsg(isDuplicated ? "이미 사용 중인 닉네임입니다. ❌" : "닉네임 중복 체크 실패. 다시 시도해 주세요.");
    } finally {
      setIsCheckingNickname(false);
    }
  };

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!isEmailChecked) {
      setErrorMessage("이메일 중복 확인을 완료해 주세요.");
      return;
    }

    if (!isEmailVerified) {
      setErrorMessage("이메일 인증코드 확인을 완료해 주세요.");
      return;
    }

    if (!verificationCode || verificationCode.length !== 6) {
      setErrorMessage("6자리 이메일 인증코드를 입력해 주세요.");
      return;
    }

    if (timer === 0) {
      setErrorMessage("인증 유효 시간이 초과되었습니다. 인증번호를 다시 발송해 주세요.");
      return;
    }

    if (!isNicknameChecked) {
      setErrorMessage("닉네임 중복 확인을 완료해 주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setIsLoading(true);

      await signup({
        email,
        nickname,
        password,
        verificationCode,
      });

      setSuccessMessage("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error(error);
      setErrorMessage("회원가입에 실패했습니다. 다시 양식을 확인해 주세요.");
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

          {/* Right Panel: Signup Form */}
          <div className="p-8 md:p-12 md:col-span-7 flex flex-col justify-center">
            <div className="mb-6">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">
                Join DATT
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                회원가입
              </h1>
              <p className="mt-1.5 text-xs text-slate-500">
                나만의 장소를 저장하고, 나만의 Anchor를 만들어보세요.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-200/50 p-4 text-xs font-bold text-rose-700 animate-fadeIn">
                ⚠️ {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200/50 p-4 text-xs font-bold text-emerald-700 animate-fadeIn">
                ✨ {successMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email Input with Inline Check Button */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일 주소</Label>
                <div className="flex gap-2">
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setIsEmailChecked(false);
                      setEmailCheckMsg("");
                    }}
                    className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCheckEmail}
                    disabled={isCheckingEmail || !email}
                    className="h-12 px-5 rounded-2xl whitespace-nowrap text-xs cursor-pointer shrink-0"
                  >
                    {isCheckingEmail ? "검사 중" : "중복 확인"}
                  </Button>
                </div>
                {emailCheckMsg && (
                  <p className={`text-xs font-semibold ${isEmailChecked ? "text-emerald-600" : "text-rose-600"}`}>
                    {emailCheckMsg}
                  </p>
                )}
              </div>

              {/* Email Verification Section */}
              {isEmailChecked && (
                <div className="space-y-2 rounded-2xl bg-indigo-50/30 border border-indigo-100/50 p-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="verificationCode">이메일 인증코드</Label>
                    {isTimerRunning && !isEmailVerified && (
                      <span className="text-xs font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md animate-pulse">
                        남은 시간 {formatTimer()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="verificationCode"
                      type="text"
                      maxLength={6}
                      placeholder={isEmailVerified ? "인증 완료됨" : isVerificationSent ? "6자리 인증번호를 입력하세요" : "인증번호 발송을 눌러주세요"}
                      disabled={!isVerificationSent || timer === 0 || isEmailVerified}
                      value={verificationCode}
                      onChange={(event) => {
                        setVerificationCode(event.target.value);
                        setEmailVerificationMsg("");
                      }}
                      className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white disabled:bg-slate-50 disabled:text-slate-450"
                    />
                    {!isEmailVerified ? (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleSendVerification}
                        disabled={isSendingEmail}
                        className="h-12 px-5 rounded-2xl whitespace-nowrap text-xs cursor-pointer shrink-0"
                      >
                        {isSendingEmail ? "발송 중" : isVerificationSent ? "재발송" : "인증코드 발송"}
                      </Button>
                    ) : (
                      <span className="h-12 px-5 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/50 text-xs shrink-0 select-none">
                        인증 완료 ✅
                      </span>
                    )}
                  </div>

                  {/* Verify Code Button */}
                  {isVerificationSent && !isEmailVerified && (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleVerifyCode}
                      disabled={isCheckingCode || timer === 0 || verificationCode.length !== 6}
                      className="w-full h-11 text-xs rounded-xl mt-1"
                    >
                      {isCheckingCode ? "확인 중..." : "인증번호 확인"}
                    </Button>
                  )}

                  {emailVerificationMsg && (
                    <p className={`text-xs font-semibold ${isEmailVerified ? "text-emerald-600" : "text-rose-600"}`}>
                      {emailVerificationMsg}
                    </p>
                  )}
                  {timer === 0 && isVerificationSent && !isEmailVerified && (
                    <p className="text-xs font-semibold text-rose-600">
                      인증 유효 시간이 만료되었습니다. 인증코드를 재발송해 주세요.
                    </p>
                  )}
                </div>
              )}

              {/* Nickname Input with Inline Check Button */}
              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임</Label>
                <div className="flex gap-2">
                  <input
                    id="nickname"
                    type="text"
                    placeholder="닉네임을 입력하세요"
                    autoComplete="nickname"
                    value={nickname}
                    onChange={(event) => {
                      setNickname(event.target.value);
                      setIsNicknameChecked(false);
                      setNicknameCheckMsg("");
                    }}
                    className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCheckNickname}
                    disabled={isCheckingNickname || !nickname}
                    className="h-12 px-5 rounded-2xl whitespace-nowrap text-xs cursor-pointer shrink-0"
                  >
                    {isCheckingNickname ? "검사 중" : "중복 확인"}
                  </Button>
                </div>
                {nicknameCheckMsg && (
                  <p className={`text-xs font-semibold ${isNicknameChecked ? "text-emerald-600" : "text-rose-600"}`}>
                    {nicknameCheckMsg}
                  </p>
                )}
              </div>

              <Input
                id="password"
                label="비밀번호"
                type="password"
                placeholder="비밀번호를 입력하세요"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <Input
                id="passwordConfirm"
                label="비밀번호 확인"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
              />

              <Button
                type="submit"
                className="w-full mt-2"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "가입 중..." : "회원가입"}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              이미 계정이 있으신가요?{" "}
              <Link
                href="/login"
                className="font-bold text-indigo-600 hover:underline"
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
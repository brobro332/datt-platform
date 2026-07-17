"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Anchor, Search, MapPin, Compass, User, LogOut } from "lucide-react";

import { logout as logoutRequest } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";

const navigationItems = [
  {
    href: "/place-master",
    label: "닻내리기",
    icon: Anchor,
  },
  {
    href: "/place-search",
    label: "장소탐색",
    icon: Search,
  },
  {
    href: "/map",
    label: "위치탐색",
    icon: MapPin,
  },
  {
    href: "/anchors",
    label: "피드",
    icon: Compass,
  },
];

export function GlobalHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const logout = useAuthStore(
    (state) => state.logout,
  );

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const member = useAuthStore((state) => state.member);

  async function handleLogout() {
    try {
      await logoutRequest();
    } finally {
      logout();
      router.push("/login");
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/40 bg-white/75 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md shadow-slate-200 group-hover:scale-105 transition-transform duration-200">
              <Anchor className="w-5 h-5 stroke-[2.5px]" />
            </div>

            <div className="leading-tight">
              <p className="text-lg font-black tracking-tight text-slate-900">
                DATT
              </p>
              <p className="text-[10px] font-medium text-slate-450 uppercase tracking-wider">
                Discover All The Town
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "px-3.5 py-2 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-blue-50/60 text-blue-600 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            {isLoggedIn ? (
              <>
                <Link
                  href="/my/profile"
                  className={[
                    "hidden rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 sm:inline-flex items-center gap-1.5",
                    pathname === "/my/profile"
                      ? "bg-blue-50/60 text-blue-600"
                      : "text-slate-650 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")}
                >
                  <User className="w-4 h-4" />
                  {member?.nickname ?? "내 프로필"}
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex rounded-xl px-3.5 sm:px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  로그인
                </Link>

                <Link
                  href="/signup"
                  className="rounded-xl bg-blue-600 px-3.5 sm:px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-100 hover:bg-blue-500 hover:shadow-blue-200 transition active:scale-95"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-slate-200/50 bg-white/80 pb-safe backdrop-blur-lg shadow-[0_-4px_24px_rgba(59,130,246,0.06)] md:hidden">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex flex-col items-center justify-center w-16 h-[52px] gap-0.5 transition-all duration-200 relative",
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-700"
              ].join(" ")}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px] scale-105" : "stroke-[2px]"}`} />
              <span className={`text-[9px] ${isActive ? "font-black" : "font-semibold"}`}>{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 h-1 w-1 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
        {isLoggedIn ? (
          <Link
            href="/my/profile"
            className={[
              "flex flex-col items-center justify-center w-16 h-[52px] gap-0.5 transition-all duration-200 relative",
              pathname === "/my/profile" ? "text-blue-600" : "text-slate-400 hover:text-slate-700"
            ].join(" ")}
          >
            <User className={`w-5 h-5 ${pathname === "/my/profile" ? "stroke-[2.5px] scale-105" : "stroke-[2px]"}`} />
            <span className={`text-[9px] ${pathname === "/my/profile" ? "font-black" : "font-semibold"}`}>프로필</span>
            {pathname === "/my/profile" && (
              <span className="absolute bottom-0 h-1 w-1 rounded-full bg-blue-600" />
            )}
          </Link>
        ) : (
          <Link
            href="/login"
            className={[
              "flex flex-col items-center justify-center w-16 h-[52px] gap-0.5 transition-all duration-200 relative",
              pathname === "/login" ? "text-blue-600" : "text-slate-400 hover:text-slate-700"
            ].join(" ")}
          >
            <User className={`w-5 h-5 ${pathname === "/login" ? "stroke-[2.5px] scale-105" : "stroke-[2px]"}`} />
            <span className={`text-[9px] ${pathname === "/login" ? "font-black" : "font-semibold"}`}>로그인</span>
            {pathname === "/login" && (
              <span className="absolute bottom-0 h-1 w-1 rounded-full bg-blue-600" />
            )}
          </Link>
        )}
      </nav>
    </>
  );
}
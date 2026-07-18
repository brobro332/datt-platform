"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { PlusCircle, Image as ImageIcon, LogOut, ShieldAlert, ArrowLeft, Menu, X } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, member, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const storedMember = localStorage.getItem("member");
      if (storedMember) {
        const parsed = JSON.parse(storedMember);
        if (parsed.role === "ADMIN") {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          alert("관리자 권한이 없습니다. 메인 페이지로 이동합니다.");
          router.replace("/");
        }
      } else {
        setIsAuthorized(false);
        alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthorized === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white font-semibold text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>관리자 보안 검증 중...</span>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-center px-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-black text-white">관리자 권한 없음</h1>
        <p className="text-slate-400 mt-2 font-semibold">이 구역은 공인된 관리자만 접근할 수 있습니다.</p>
        <Link
          href="/"
          className="mt-6 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:scale-95 transition"
        >
          메인 페이지로 탈출
        </Link>
      </div>
    );
  }

  const menuItems = [
    {
      name: "매장 등록",
      href: "/admin/places",
      icon: PlusCircle,
    },
    {
      name: "광고 관리",
      href: "/admin/ads",
      icon: ImageIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 h-16 w-full border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition md:hidden cursor-pointer"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-slate-200">
              ⚓ DATT Admin Portal
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] text-indigo-300 font-black uppercase tracking-wider">Administrator</span>
            <span className="text-xs font-bold text-slate-355">{member?.nickname || "관리자"}님</span>
          </div>
          <div className="w-px h-8 bg-slate-800 hidden sm:block" />
          
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-700 text-xs font-extrabold text-slate-300 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 사용자 화면
          </Link>

          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="p-2 rounded-xl text-slate-400 hover:bg-rose-950/30 hover:text-rose-400 transition cursor-pointer"
            title="로그아웃"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Admin Sidebar */}
        <aside
          className={`fixed inset-y-16 left-0 z-40 w-64 border-r border-slate-800 bg-slate-900 p-5 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-6">
            <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3">
              Navigation Menu
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 font-black"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400"
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-3 bg-slate-850 rounded-2xl border border-slate-800 text-[11px] font-semibold text-slate-500">
            <div>💡 보안 주의</div>
            <div className="mt-1 leading-normal">관리자 포털의 모든 행위는 서버 감사 로그에 기록됩니다. 작업 완료 후 반드시 로그아웃을 진행해 주세요.</div>
          </div>
        </aside>

        {/* Sidebar Overlay (Mobile) */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          />
        )}

        {/* Admin Content Area */}
        <main className="flex-1 bg-slate-950 p-6 md:p-10 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

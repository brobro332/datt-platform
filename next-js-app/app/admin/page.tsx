"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardShell() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /admin/places as the default page
    router.replace("/admin/places");
  }, [router]);

  return (
    <div className="flex h-[50vh] w-full items-center justify-center text-slate-400 font-semibold text-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span>관리 포털로 리다이렉트 중...</span>
      </div>
    </div>
  );
}

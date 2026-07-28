"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { UserCircle2, Loader2, ShieldAlert } from "lucide-react";

interface Member {
  id: number;
  email: string;
  nickname: string;
  role: string;
  level: number;
  exp: number;
  createdAt: string;
}

interface PageResponse {
  content: Member[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export default function AdminMembersPage() {
  const [data, setData] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchMembers(page);
  }, [page]);

  const fetchMembers = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/admin/members?page=${pageNumber}&size=20`);
      if (res.data.success) {
        setData(res.data.data);
      } else {
        setError(res.data.error?.message || "회원 목록을 불러오는 데 실패했습니다.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !data) {
    return (
      <div className="flex h-96 w-full items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-96 w-full items-center justify-center text-rose-400 gap-4">
        <ShieldAlert className="w-12 h-12" />
        <p className="font-semibold">{error}</p>
        <button
          onClick={() => fetchMembers(page)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm transition"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <UserCircle2 className="w-6 h-6 text-indigo-400" />
            회원 관리
          </h1>
          <p className="mt-2 text-sm text-slate-400 font-medium">
            전체 가입자 목록 및 권한, 레벨 현황을 조회합니다. (총 {data?.totalElements || 0}명)
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th scope="col" className="px-6 py-4 font-black">ID</th>
                <th scope="col" className="px-6 py-4 font-black">계정 (이메일)</th>
                <th scope="col" className="px-6 py-4 font-black">닉네임</th>
                <th scope="col" className="px-6 py-4 font-black">권한</th>
                <th scope="col" className="px-6 py-4 font-black text-center">레벨 / EXP</th>
                <th scope="col" className="px-6 py-4 font-black text-right">가입일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.content.map((member) => (
                <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-500">
                    #{member.id}
                  </td>
                  <td className="px-6 py-4 text-slate-200">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {member.nickname}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider ${
                      member.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-sky-400">Lv.{member.level}</span>
                      <span className="text-[10px] text-slate-500">{member.exp.toLocaleString()} EXP</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 text-xs font-medium whitespace-nowrap">
                    {formatDate(member.createdAt)}
                  </td>
                </tr>
              ))}
              {data?.content.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    가입된 회원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/30">
            <span className="text-xs text-slate-500 font-medium">
              Page {data.number + 1} of {data.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={data.number === 0}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition"
              >
                이전
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                disabled={data.number >= data.totalPages - 1}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

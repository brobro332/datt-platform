"use client";

import { useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/layouts/MainLayout";
import { Card } from "@/components/common/Card";
import { AsyncStateView } from "@/components/common/AsyncStateView";

import { useMyAnchors } from "@/hooks/useMyAnchors";
import { useMyProfile } from "@/hooks/useMyProfile";
import { Heart, Anchor, MapPin, Eye } from "lucide-react";

const PAGE_SIZE = 6;

export default function MyLikesPage() {
  const [page, setPage] = useState(0);
  const { data: profile } = useMyProfile();
  
  // Sort by POPULAR to list the most liked anchors first!
  const { data, isLoading, isError } = useMyAnchors({ sortType: "POPULAR", page, size: PAGE_SIZE });

  function handlePreviousPage() {
    setPage((prev) => Math.max(prev - 1, 0));
  }

  function handleNextPage() {
    if (data && !data.last) {
      setPage((prev) => prev + 1);
    }
  }

  const displayAnchors = data ? data.content : [];

  return (
    <MainLayout requireAuth>
      <section className="space-y-8 pb-32">
        {/* Header Hero Card */}
        <div className="rounded-[2.5rem] border border-slate-200/50 bg-white/80 p-8 md:p-10 shadow-sm backdrop-blur-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-blue-500" /> Received Likes
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">받은 좋아요</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-xl font-semibold">
                다른 선원들로부터 추천(좋아요)을 받은 내 닻 정박 코스들입니다. 높은 인기를 얻은 인기 닻 리포트를 확인해 보세요.
              </p>
            </div>
            
            <div className="rounded-3xl bg-blue-50 border border-blue-100 px-6 py-4 text-center shadow-sm shrink-0 flex items-center gap-2">
              <Heart className="w-5 h-5 fill-blue-500 text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest text-left">Total Likes</p>
                <p className="mt-1 text-2xl font-black text-blue-700">
                  {profile?.activitySummary.receivedLikeCount.toLocaleString() ?? 0}개
                </p>
              </div>
            </div>
          </div>
        </div>

        <AsyncStateView
          isLoading={isLoading}
          isError={isError}
          isEmpty={Boolean(data?.empty)}
          loadingMessage="추천받은 닻 목록을 불러오는 중입니다..."
          errorTitle="닻 조회 실패"
          errorMessage="목록 정보를 불러오지 못했습니다. 다시 시도해 주세요."
          emptyTitle="아직 받은 좋아요가 없습니다."
          emptyDescription="내 닻을 공개로 전환하고 매력적인 추천 코스를 구성해 보세요!"
        >
          {data && (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {displayAnchors.map((anchor) => (
                  <Link key={anchor.anchorId} href={`/anchors/${anchor.anchorId}`}>
                    <Card className="p-6 flex flex-col justify-between h-[230px] border border-slate-200/60 bg-white/80 backdrop-blur-sm hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 rounded-2xl group">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                              <Anchor className="w-4 h-4 text-blue-600" />
                            </div>
                            <h2 className="font-extrabold text-sm text-slate-900 truncate max-w-[150px]">
                              {anchor.title}
                            </h2>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs">
                          <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 기준: <span className="text-slate-800 font-extrabold">{anchor.basePlaceName || "지정 지역"}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 truncate pl-4.5">
                            {anchor.baseAddress || "주소 정보 없음"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100/80 pt-3 text-[10px] font-black text-slate-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-0.5">
                            <Eye className="w-3 h-3 text-slate-400" /> {anchor.viewCount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-0.5 text-rose-600 font-black">
                            <Heart className="w-3 h-3 fill-rose-500 text-rose-600" /> {anchor.likeCount.toLocaleString()}
                          </span>
                        </div>
                        <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100/25">
                          명소 {anchor.placeCount}개
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="mt-8 flex items-center justify-between">
                <p className="text-xs font-black text-slate-500">
                  {data.number + 1} / {data.totalPages} 페이지
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePreviousPage}
                    disabled={data.first}
                    className="px-5 h-10 rounded-xl text-xs font-black border border-slate-200 bg-white/80 text-slate-700 shadow-sm transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 cursor-pointer"
                  >
                    이전
                  </button>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={data.last}
                    className="px-5 h-10 rounded-xl text-xs font-black border border-slate-200 bg-white/80 text-slate-700 shadow-sm transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 cursor-pointer"
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          )}
        </AsyncStateView>
      </section>
    </MainLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/layouts/MainLayout";
import { Card } from "@/components/common/Card";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { getPublicAnchors, type AnchorSortType, type AnchorSummaryResponse, type PageResponse } from "@/services/anchorService";
import { Anchor, MapPin, Eye, Heart } from "lucide-react";

export default function AnchorsPage() {
  const [sortType, setSortType] = useState<AnchorSortType>("LATEST");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<AnchorSummaryResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchAnchors = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const res = await getPublicAnchors({ sortType, page, size: 6 });
      setData(res);
    } catch (err) {
      console.error(err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnchors();
  }, [sortType, page]);

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    if (data && !data.last) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <MainLayout requireAuth>
      <section className="space-y-8 pb-32">
        {/* Header Hero Card */}
        <div className="rounded-[2.5rem] border border-slate-200/50 bg-white/80 p-8 md:p-10 backdrop-blur-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                <Anchor className="w-3.5 h-3.5 text-blue-500" /> Feed
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">피드</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-xl font-semibold">
                DATT 탐험가들이 직접 생성한 다양하고 개성 있는 닻 목록입니다. 인기 추천 코스와 핫플레이스들을 둘러보세요.
              </p>
            </div>

            {/* Sort Toggle (LATEST / POPULAR) */}
            <div className="flex h-12 bg-slate-100/60 p-1 rounded-2xl border border-slate-200/50 shadow-inner shrink-0 w-full md:w-auto items-center">
              <button
                onClick={() => { setSortType("LATEST"); setPage(0); }}
                className={`flex-1 md:flex-none text-center px-6 h-[90%] rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer active:scale-95 flex items-center justify-center ${
                  sortType === "LATEST"
                    ? "text-blue-600 bg-white shadow-md shadow-slate-200"
                    : "text-slate-400 hover:text-blue-600"
                }`}
              >
                최신순
              </button>
              <button
                onClick={() => { setSortType("POPULAR"); setPage(0); }}
                className={`flex-1 md:flex-none text-center px-6 h-[90%] rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer active:scale-95 flex items-center justify-center ${
                  sortType === "POPULAR"
                    ? "text-blue-600 bg-white shadow-md shadow-slate-200"
                    : "text-slate-400 hover:text-blue-600"
                }`}
              >
                인기순
              </button>
            </div>
          </div>
        </div>

        {/* Content List */}
        {isLoading ? (
          <LoadingState message="닻 목록을 불러오는 중입니다..." />
        ) : isError ? (
          <ErrorState title="닻 목록 조회 실패" message="정보를 불러오지 못했습니다. 다시 시도해 주세요." />
        ) : data?.content.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold bg-white/50 backdrop-blur-sm rounded-[2rem] border border-slate-200/40">
            등록된 공개 닻이 아직 없습니다. 첫 번째 닻의 주인공이 되어보세요!
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {data?.content.map((anchor) => (
                <Link key={anchor.anchorId} href={`/anchors/${anchor.anchorId}`}>
                  <Card className="p-6 flex flex-col justify-between h-[230px] border border-slate-100/70 hover:border-blue-200 hover:-translate-y-[6px] hover:shadow-[0_20px_50px_rgba(59,130,246,0.06)] transition-all duration-500 bg-white/75 backdrop-blur-md rounded-2xl group shadow-[0_8px_30px_rgba(0,0,0,0.005)]">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-base shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                          <Anchor className="w-4 h-4 text-blue-600" />
                        </div>
                        <h2 className="font-extrabold text-sm text-slate-900 truncate max-w-[180px]">
                          {anchor.title}
                        </h2>
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 기준: <span className="text-slate-800 font-extrabold">{anchor.basePlaceName || "지정 지역"}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 truncate pl-4.5">
                          {anchor.baseAddress || "주소 정보 없음"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100/80 pt-3 text-[10px] font-extrabold text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-slate-400" /> {anchor.viewCount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-rose-500">
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> {anchor.likeCount.toLocaleString()}
                        </span>
                      </div>
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100/10">
                        명소 {anchor.placeCount}개
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {data && (
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
            )}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
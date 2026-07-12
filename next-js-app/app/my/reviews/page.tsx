"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { MainLayout } from "@/layouts/MainLayout";
import { Card } from "@/components/common/Card";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { useMyProfile } from "@/hooks/useMyProfile";
import { deletePlaceReview } from "@/services/reviewService";
import { MessageSquare, Star, Trash2, Calendar, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function MyReviewsPage() {
  const { data: profile, isLoading, isError, refetch } = useMyProfile();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleDeleteReview = async (placeId: number, reviewId: number, placeName: string) => {
    if (!confirm(`"${placeName}"에 작성하신 리뷰를 삭제하시겠습니까?`)) return;

    try {
      setIsDeleting(reviewId);
      await deletePlaceReview(placeId, reviewId);
      alert("리뷰가 성공적으로 삭제되었습니다.");
      
      // Invalidate queries to update profile counts and state
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      refetch();
    } catch (err) {
      console.error(err);
      alert("리뷰 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(null);
    }
  };

  const reviews = profile?.recentReviews ?? [];

  return (
    <MainLayout requireAuth>
      <section className="space-y-8 pb-32">
        {/* Header Hero Card */}
        <div className="rounded-[2.5rem] border border-slate-200/50 bg-white/80 p-8 md:p-10 shadow-sm backdrop-blur-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> My Reviews
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">작성한 리뷰</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-xl font-semibold">
                DATT에서 내가 직접 남긴 솔직한 후기 목록입니다. 작성된 별점과 코멘트를 관리해 보세요.
              </p>
            </div>
            
            <div className="rounded-3xl bg-indigo-50 border border-indigo-100 px-6 py-4 text-center shadow-sm shrink-0">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Total reviews</p>
              <p className="mt-1 text-2xl font-black text-indigo-700">
                {profile?.activitySummary.reviewCount.toLocaleString() ?? 0}개
              </p>
            </div>
          </div>
        </div>

        {isLoading && (
          <LoadingState message="작성한 리뷰 목록을 불러오는 중입니다..." />
        )}

        {isError && (
          <ErrorState
            title="리뷰 조회 실패"
            message="작성한 리뷰 목록을 불러오지 못했습니다. 다시 시도해 주세요."
          />
        )}

        {!isLoading && !isError && reviews.length === 0 && (
          <div className="py-20 text-center text-slate-400 font-bold bg-white/50 backdrop-blur-sm rounded-[2rem] border border-slate-200/40">
            작성한 리뷰가 아직 없습니다.
          </div>
        )}

        {!isLoading && !isError && reviews.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            {reviews.map((review) => (
              <Card key={review.reviewId} className="p-6 flex flex-col justify-between h-[230px] border border-slate-200/60 bg-white/80 backdrop-blur-sm hover:border-indigo-300 hover:shadow-md transition-all duration-300 rounded-2xl group relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[200px]">
                        <Link href={`/place-search/${review.placeId}`}>
                          {review.placeName}
                        </Link>
                      </h2>
                      <div className="flex items-center gap-1.5 text-amber-500 text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {review.rating.toFixed(1)}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Link
                        href={`/place-search/${review.placeId}`}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-500 shadow-sm transition active:scale-95 cursor-pointer"
                        title="장소 상세 보기"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(review.placeId, review.reviewId, review.placeName)}
                        disabled={isDeleting === review.reviewId}
                        className="p-2 rounded-xl border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
                        title="리뷰 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-semibold leading-relaxed text-slate-500 line-clamp-3">
                    {review.content}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100/80 pt-3 text-[10px] font-black text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(review.createdAt).toLocaleDateString()} 작성
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}

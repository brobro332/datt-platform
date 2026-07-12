"use client";

import { AsyncStateView } from "@/components/common/AsyncStateView";
import { ReviewCard } from "@/components/review/ReviewCard";

import { usePlaceReviews } from "@/hooks/usePlaceReviews";

type ReviewListSectionProps = {
    placeId: number;
};

export function ReviewListSection({
    placeId,
}: ReviewListSectionProps) {

    const {
        data,
        isLoading,
        isError,
    } = usePlaceReviews(placeId);

    const reviews = data?.content ?? [];

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                        방문자 리뷰
                    </h2>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                        실제 방문객들이 들려주는 DATT의 생생한 경험담
                    </p>
                </div>

                <div className="rounded-xl bg-indigo-50 border border-indigo-100/50 px-3.5 py-1 text-xs font-extrabold text-indigo-600 shadow-sm">
                    {reviews?.length ?? 0}개
                </div>
            </div>

            <AsyncStateView
                isLoading={isLoading}
                isError={isError}
                isEmpty={!isLoading && (reviews?.length ?? 0) === 0}
                loadingMessage="소중한 경험담을 불러오는 중입니다..."
                errorTitle="리뷰 조회 실패"
                errorMessage="경험담 목록을 불러오지 못했습니다."
                emptyTitle="아직 작성된 리뷰가 없습니다."
                emptyDescription="첫 번째 경험을 기록하여 소중한 닻을 밝혀보세요!"
            >
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewCard
                            key={review.reviewId}
                            review={review}
                        />
                    ))}
                </div>
            </AsyncStateView>
        </section>
    );
}
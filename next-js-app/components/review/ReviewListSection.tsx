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
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-950">
                        리뷰
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        사용자들의 실제 방문 경험입니다.
                    </p>
                </div>

                <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                    {reviews?.length ?? 0}개
                </div>
            </div>

            <AsyncStateView
                isLoading={isLoading}
                isError={isError}
                isEmpty={!isLoading && (reviews?.length ?? 0) === 0}
                loadingMessage="리뷰를 불러오는 중입니다..."
                errorTitle="리뷰 조회 실패"
                errorMessage="리뷰를 불러오지 못했습니다."
                emptyTitle="아직 리뷰가 없습니다."
                emptyDescription="첫 번째 리뷰를 작성해보세요."
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
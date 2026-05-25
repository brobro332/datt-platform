import type { PlaceReviewResponse } from "@/types/review";

type ReviewCardProps = {
    review: PlaceReviewResponse;
};

export function ReviewCard({
    review,
}: ReviewCardProps) {
    return (
        <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-gray-900">
                        {review.nickname}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        {new Date(
                            review.createdAt,
                        ).toLocaleDateString()}
                    </p>
                </div>

                <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
                    ⭐ {review.rating.toFixed(1)}
                </div>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {review.content}
            </p>
        </article>
    );
}
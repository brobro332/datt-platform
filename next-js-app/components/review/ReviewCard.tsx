import { useState } from "react";
import type { PlaceReviewResponse } from "@/types/review";
import { useAuthStore } from "@/stores/authStore";
import { useUpdatePlaceReview, useDeletePlaceReview } from "@/hooks/usePlaceReviewMutation";
import { Button } from "@/components/common/Button";
import { apiClient } from "@/lib/apiClient";

type ReviewCardProps = {
    review: PlaceReviewResponse;
};

export function ReviewCard({
    review,
}: ReviewCardProps) {
    const { member } = useAuthStore();
    const isOwner = member && member.memberId === review.memberId;

    const updateMutation = useUpdatePlaceReview(review.placeId);
    const deleteMutation = useDeletePlaceReview(review.placeId);

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(review.content);
    const [editRating, setEditRating] = useState(review.rating);
    const [isSaving, setIsSaving] = useState(false);
    const [imgError, setImgError] = useState(false);

    const handleImageError = async () => {
        setImgError(true);
        if (review.imageUrl) {
            try {
                await apiClient.post("/api/files/report-broken", { imageUrl: review.imageUrl });
            } catch (err) {
                console.error("Failed to report broken image URL:", err);
            }
        }
    };

    const handleDelete = async () => {
        if (!confirm("정말 이 리뷰를 삭제하시겠습니까?")) return;
        try {
            await deleteMutation.mutateAsync(review.reviewId);
            alert("리뷰가 삭제되었습니다.");
        } catch (err) {
            console.error(err);
            alert("리뷰 삭제에 실패했습니다.");
        }
    };

    const handleUpdate = async () => {
        const trimmed = editContent.trim();
        if (!trimmed) {
            alert("리뷰 내용을 입력해 주세요.");
            return;
        }
        try {
            setIsSaving(true);
            await updateMutation.mutateAsync({
                reviewId: review.reviewId,
                request: {
                    rating: editRating,
                    content: trimmed,
                    imageUrl: review.imageUrl,
                },
            });
            setIsEditing(false);
            alert("리뷰가 수정되었습니다.");
        } catch (err) {
            console.error(err);
            alert("리뷰 수정에 실패했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isEditing) {
        return (
            <article className="rounded-3xl border border-slate-200/50 bg-white/70 backdrop-blur-sm p-6 shadow-sm">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-700">평점 변경:</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setEditRating(star)}
                                    className="text-lg focus:outline-none transition transform active:scale-90 cursor-pointer text-amber-400"
                                >
                                    {star <= editRating ? "★" : "☆"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full min-h-24 p-3 border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500 bg-white/80"
                        maxLength={1000}
                    />

                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setIsEditing(false);
                                setEditContent(review.content);
                                setEditRating(review.rating);
                            }}
                            className="h-9 px-4 text-xs rounded-xl"
                            disabled={isSaving}
                        >
                            취소
                        </Button>
                        <Button
                            type="button"
                            onClick={handleUpdate}
                            className="h-9 px-4 text-xs rounded-xl"
                            disabled={isSaving}
                        >
                            {isSaving ? "저장 중" : "저장"}
                        </Button>
                    </div>
                </div>
            </article>
        );
    }

    return (
        <article className="rounded-3xl border border-slate-200/50 bg-white/70 backdrop-blur-sm p-6 shadow-sm shadow-slate-100/50 hover:shadow-md hover:shadow-slate-200/60 transition-all duration-300">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-extrabold text-slate-800">
                        {review.nickname}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                        ⏱ {new Date(review.createdAt).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-amber-50 border border-amber-200/50 px-2.5 py-1 text-xs font-black text-amber-700">
                        ★ {review.rating.toFixed(1)}
                    </div>
                </div>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-600">
                {review.content}
            </p>

            {review.imageUrl && !imgError && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 max-w-sm max-h-56 shadow-sm hover:opacity-95 transition-opacity">
                    <img
                        src={review.imageUrl}
                        alt="리뷰 이미지"
                        className="w-full h-full object-cover max-h-56"
                        onError={handleImageError}
                    />
                </div>
            )}

            {isOwner && (
                <div className="mt-4 flex gap-2 justify-end border-t border-slate-100/80 pt-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs font-bold text-slate-400 hover:text-indigo-650 transition cursor-pointer"
                    >
                        수정하기
                    </button>
                    <span className="text-slate-200 text-xs">|</span>
                    <button
                        onClick={handleDelete}
                        className="text-xs font-bold text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                        삭제하기
                    </button>
                </div>
            )}
        </article>
    );
}
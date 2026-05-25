"use client";

import { useState } from "react";

import { Button } from "@/components/common/Button";
import { FormErrorMessage } from "@/components/common/FormErrorMessage";
import { FormSection } from "@/components/common/FormSection";
import { Textarea } from "@/components/common/Textarea";

import { useCreatePlaceReview } from "@/hooks/usePlaceReviewMutation";
import { ActivityFeedback } from "../gamification/ActivityFeedback";

import {
    isBlank,
    isInRange,
} from "@/utils/validation";

type ReviewCreateFormProps = {
    placeId: number;
};

export function ReviewCreateForm({
    placeId,
}: ReviewCreateFormProps) {
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState("");

    const createReviewMutation = useCreatePlaceReview(placeId);

    async function handleSubmit(event: { preventDefault: () => void }) {
        event.preventDefault();

        const trimmedContent = content.trim();

        if (!isInRange(rating, 1, 5)) {
            setErrorMessage("평점은 1점 이상 5점 이하만 가능합니다.");
            return;
        }

        if (isBlank(trimmedContent)) {
            setErrorMessage("리뷰 내용을 입력해주세요.");
            return;
        }

        if (trimmedContent.length > 1000) {
            setErrorMessage("리뷰 내용은 1000자 이하로 입력해주세요.");
            return;
        }

        try {
            setErrorMessage("");

            await createReviewMutation.mutateAsync({
                rating,
                content: trimmedContent,
            });

            setRating(5);
            setContent("");
            setFeedbackMessage("리뷰 작성 완료! 경험치 +15 획득");
        } catch (error) {
            console.error(error);
            setErrorMessage("리뷰 작성에 실패했습니다.");
        }
    }
    
    return (
        <FormSection
            title="리뷰 작성"
            description="이 장소에 대한 경험을 남겨주세요."
        >
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label
                        htmlFor="rating"
                        className="text-sm font-medium text-gray-700"
                    >
                        평점
                    </label>

                    <select
                        id="rating"
                        value={rating}
                        onChange={(event) =>
                            setRating(Number(event.target.value))
                        }
                        className="h-11 w-full rounded-2xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                    >
                        <option value={5}>5점</option>
                        <option value={4}>4점</option>
                        <option value={3}>3점</option>
                        <option value={2}>2점</option>
                        <option value={1}>1점</option>
                    </select>
                </div>

                <Textarea
                    id="reviewContent"
                    label="리뷰 내용"
                    placeholder="방문 경험을 작성해주세요."
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                />

                <FormErrorMessage message={errorMessage} />

                <Button
                    type="submit"
                    disabled={createReviewMutation.isPending}
                >
                    {createReviewMutation.isPending
                        ? "작성 중..."
                        : "리뷰 작성"}
                </Button>

                <ActivityFeedback message={feedbackMessage} />
            </form>
        </FormSection>
    );
}
"use client";

import { useState } from "react";

import { Button } from "@/components/common/Button";
import { FormErrorMessage } from "@/components/common/FormErrorMessage";
import { Card } from "@/components/common/Card";
import { Label } from "@/components/common/Label";

import { useCreatePlaceReview } from "@/hooks/usePlaceReviewMutation";
import { usePlaceDetail } from "@/hooks/usePlaceDetail";
import { getCategoryFromText } from "@/utils/category";
import { ActivityFeedback } from "../gamification/ActivityFeedback";
import { uploadFile } from "@/services/fileService";

import {
    isBlank,
    isInRange,
} from "@/utils/validation";

type ReviewCreateFormProps = {
    placeId: number;
};

const RATING_TEXTS: Record<number, string> = {
    1: "많이 아쉬웠어요 😞",
    2: "조금 아쉬웠어요 😕",
    3: "보통이었어요 🙂",
    4: "만족스러웠어요 😊",
    5: "기대 이상으로 완벽했어요! 🌟",
};

const PLACEHOLDERS: Record<number, string> = {
    1: "아쉬운 점이 많으셨나요? 개선을 위해 서비스, 위생, 환경 등에 대해 피드백을 남겨주시면 큰 도움이 됩니다.",
    2: "어떤 부분이 다소 부족하거나 아쉬우셨나요? 상세히 남겨주시면 서비스 개선에 큰 도움이 됩니다.",
    3: "평범했던 정박 경험이었나요? 좋았던 점과 아쉬웠던 점을 솔직하게 공유해주세요.",
    4: "만족스러운 시간이었군요! 어떤 점이 특히 만족스러웠는지 생생한 방문 경험을 들려주세요.",
    5: "기대 이상으로 완벽했군요! 이곳의 매력과 최고의 순간을 다른 선원들에게 자세히 전해주세요!"
};

const TAG_RECOMMENDATIONS: Record<string, string[]> = {
    FOOD: ["😋 맛이 훌륭해요", "🌿 분위기가 좋아요", "💁 직원분이 친절해요", "💖 가성비가 최고예요", "🧹 매장이 위생적이에요", "🚗 주차하기 편해요"],
    CAFE: ["☕ 커피가 맛있어요", "🍰 디저트가 다양해요", "📸 사진이 잘 나와요", "💻 작업하기 좋아요", "🛋 좌석이 편안해요", "🌿 인테리어가 예뻐요"],
    BAR: ["🍺 주류가 다양해요", "🍢 안주가 맛있어요", "🎶 음악이 멋져요", "🌌 분위기가 힙해요", "👥 단체 모임에 좋아요", "🕵 아지트 같은 공간"],
    STAY: ["🛌 침구가 아늑해요", "🧹 위생상태가 깨끗해요", "🏙 뷰가 끝내줘요", "💁 서비스가 신속해요", "🚉 접근성이 훌륭해요", "🏊 부대시설이 많아요"],
    PLAY: ["🎡 즐길거리가 풍성해요", "📸 인생샷 명소예요", "👪 가족 동반에 추천해요", "💑 데이트에 완벽해요", "💖 요금이 아깝지 않아요", "🚶 넓고 쾌적해요"],
    OTHER: ["👍 시설이 깔끔해요", "💁 정말 친절해요", "🚗 찾아오기 편해요", "💸 가격이 합리적이에요", "🌿 공간이 예뻐요", "✨ 만족스럽습니다"]
};

export default function ReviewCreateFormWrapper({ placeId }: ReviewCreateFormProps) {
    return <ReviewCreateForm placeId={placeId} />;
}

export function ReviewCreateForm({
    placeId,
}: ReviewCreateFormProps) {
    const [rating, setRating] = useState(5);
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);
    const [content, setContent] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState("");

    // Image Upload states
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);

    const { data: placeDetail } = usePlaceDetail(placeId);
    
    const createReviewMutation = useCreatePlaceReview(placeId);

    const category = placeDetail 
        ? getCategoryFromText(placeDetail.indsMclsNm, placeDetail.indsSclsNm) 
        : "OTHER";

    const tagsList = TAG_RECOMMENDATIONS[category] || TAG_RECOMMENDATIONS.OTHER;

    const handleToggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                alert("파일 크기는 10MB 이하여야 합니다.");
                return;
            }
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl("");
        }
    };

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
            setIsUploading(true);

            let uploadedUrl: string | undefined = undefined;
            if (imageFile) {
                uploadedUrl = await uploadFile(imageFile, "reviews");
            }

            // Format tags as hashtags and append them at the end of the text
            let finalContent = trimmedContent;
            if (selectedTags.length > 0) {
                const hashtags = selectedTags
                    .map(tag => {
                        const cleanText = tag.slice(2).trim().replace(/\s+/g, "_").replace(/\//g, "_");
                        return `#${cleanText}`;
                    })
                    .join(" ");
                finalContent = `${trimmedContent}\n\n${hashtags}`;
            }

            await createReviewMutation.mutateAsync({
                rating,
                content: finalContent,
                imageUrl: uploadedUrl,
            });

            setRating(5);
            setContent("");
            setSelectedTags([]);
            handleRemoveImage();
            setFeedbackMessage("🎉 리뷰 등록 성공! 경험치 +15 획득");
            setTimeout(() => setFeedbackMessage(""), 4000);
        } catch (error) {
            console.error(error);
            setErrorMessage("리뷰 작성에 실패했습니다.");
        } finally {
            setIsUploading(false);
        }
    }
    
    return (
        <Card className="p-8 relative overflow-hidden border border-slate-200/50 shadow-sm bg-white/70 backdrop-blur-md">
            <div className="absolute top-0 right-0 -z-10 h-24 w-24 rounded-full bg-amber-200/10 blur-xl pointer-events-none" />
            
            <div className="mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    ⚓ 리뷰 작성하기
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                    이 장소에 대한 생생한 방문 경험을 다른 선원들과 솔직하게 나누어 보세요.
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Star Rating Selector */}
                <div className="space-y-3">
                    <Label className="text-slate-700 font-bold text-sm">
                        선원 평점 선택
                    </Label>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl w-fit">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isHighlighted = hoveredRating !== null ? star <= hoveredRating : star <= rating;
                                return (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(null)}
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-all transform active:scale-90 duration-100 cursor-pointer"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill={isHighlighted ? "currentColor" : "none"}
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className={`w-9 h-9 transition-all duration-150 ${
                                                isHighlighted
                                                    ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                                                    : "text-slate-200"
                                            }`}
                                        >
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    </button>
                                );
                            })}
                        </div>
                        
                        <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-3.5 py-2.5 rounded-2xl select-none w-fit transition-all">
                            {RATING_TEXTS[hoveredRating ?? rating]}
                        </span>
                    </div>
                </div>

                {/* Adaptive Keyword Tags */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-slate-700 font-bold text-sm">
                            추천 키워드 태그 (선택)
                        </Label>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            카테고리 맞춤 태그
                        </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {tagsList.map((tag) => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleToggleTag(tag)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all duration-200 cursor-pointer active:scale-95 ${
                                        isSelected
                                            ? "bg-indigo-50/80 border-indigo-200 text-indigo-700 shadow-sm shadow-indigo-100"
                                            : "bg-slate-50/60 border-slate-200/50 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                                    }`}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Textarea with Character Counter & Linear Progress */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="reviewContent" className="text-slate-700 font-bold text-sm">
                            상세 리뷰 내용
                        </Label>
                        <span className="text-[11px] font-extrabold text-slate-400 bg-slate-100/60 px-2.5 py-0.5 rounded-md">
                            {content.length} / 1000자
                        </span>
                    </div>

                    <div className="relative">
                        <textarea
                            id="reviewContent"
                            placeholder={PLACEHOLDERS[rating]}
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            className="min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-3.5 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white"
                            maxLength={1000}
                        />
                        {/* Custom Bottom Progress Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl overflow-hidden bg-slate-100">
                            <div 
                                className={`h-full transition-all duration-200 ${
                                    content.length > 900 
                                        ? "bg-rose-500" 
                                        : content.length > 700 
                                            ? "bg-amber-500" 
                                            : "bg-indigo-500"
                                }`}
                                style={{ width: `${Math.min((content.length / 1000) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Photo Upload Area */}
                <div className="space-y-3">
                    <Label className="text-slate-700 font-bold text-sm">
                        사진 첨부 (선택)
                    </Label>
                    
                    <div className="flex items-center gap-4">
                        {previewUrl ? (
                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/85 text-white rounded-full p-1 transition cursor-pointer"
                                    title="사진 삭제"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2.5"
                                        stroke="currentColor"
                                        className="w-3.5 h-3.5"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-300 transition cursor-pointer group">
                                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.8"
                                        stroke="currentColor"
                                        className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                    </svg>
                                    <span className="mt-1 text-[10px] font-bold text-slate-400 group-hover:text-indigo-500 transition">
                                        사진 등록
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                        
                        <div className="text-[11px] text-slate-400 font-semibold space-y-0.5">
                            <p>• 정박지의 실물 이미지를 첨부해 보세요.</p>
                            <p>• 10MB 이하의 이미지 파일만 등록 가능합니다.</p>
                        </div>
                    </div>
                </div>

                <FormErrorMessage message={errorMessage} />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                    <Button
                        type="submit"
                        disabled={createReviewMutation.isPending || isUploading}
                        className="w-full sm:w-40 shadow-lg shadow-indigo-600/15"
                    >
                        {createReviewMutation.isPending || isUploading ? "작성 중..." : "⚓ 리뷰 등록하기"}
                    </Button>

                    <ActivityFeedback message={feedbackMessage} />
                </div>
            </form>
        </Card>
    );
}
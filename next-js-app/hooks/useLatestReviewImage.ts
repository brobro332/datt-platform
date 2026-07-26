import { useQuery } from "@tanstack/react-query";
import { getPlaceReviews } from "@/services/reviewService";

// 프론트엔드 N+1 호출 방어 로직
// 실제 리뷰(이미지)가 없는 장소의 ID를 메모리에 기록하여
// 동일 세션 내에서 불필요한 중복 API 재요청을 원천 차단합니다.
const noImageCache = new Set<number>();

export function useLatestReviewImage(placeId: number, enabled: boolean = true) {
    return useQuery({
        queryKey: ["place-latest-image", placeId],
        queryFn: async () => {
            if (noImageCache.has(placeId)) return null;

            try {
                const reviews = await getPlaceReviews(placeId);
                const image = reviews.content.map((r: any) => r.imageUrl).find(Boolean);

                if (!image) {
                    noImageCache.add(placeId); // 데이터 0건 캐싱
                    return null;
                }
                return image;
            } catch (error) {
                console.error("Failed to fetch latest review image:", error);
                noImageCache.add(placeId); // 에러 시에도 캐싱하여 폭주 방어
                return null;
            }
        },
        // 캐시에 존재하면 아예 API 트리거 자체를 차단 (N+1 방어)
        enabled: enabled && Number.isFinite(placeId) && !noImageCache.has(placeId),
        staleTime: 1000 * 60 * 10, // 10분 캐시 유지
    });
}

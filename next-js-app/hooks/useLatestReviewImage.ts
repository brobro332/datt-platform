import { useQuery } from "@tanstack/react-query";
import { getPlaceReviews } from "@/services/reviewService";

export function useLatestReviewImage(placeId: number, enabled: boolean = true) {
    return useQuery({
        queryKey: ["place-latest-image", placeId],
        queryFn: async () => {
            const reviews = await getPlaceReviews(placeId);
            const image = reviews.content.map((r) => r.imageUrl).find(Boolean);
            return image || null;
        },
        enabled: enabled && Number.isFinite(placeId),
        staleTime: 1000 * 60 * 5, // cache for 5 minutes
    });
}

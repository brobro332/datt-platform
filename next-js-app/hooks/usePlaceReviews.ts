import { useQuery } from "@tanstack/react-query";

import { getPlaceReviews } from "@/services/reviewService";

export function usePlaceReviews(placeId: number) {
    return useQuery({
        queryKey: ["place-reviews", placeId],
        queryFn: () => getPlaceReviews(placeId),
        enabled: Number.isFinite(placeId),
    });
}
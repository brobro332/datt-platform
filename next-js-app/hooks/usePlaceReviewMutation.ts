import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createPlaceReview } from "@/services/reviewService";

import type { PlaceReviewCreateRequest } from "@/types/review";

export function useCreatePlaceReview(placeId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: PlaceReviewCreateRequest) =>
            createPlaceReview(placeId, request),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["place-reviews", placeId],
            });

            queryClient.invalidateQueries({
                queryKey: ["place", placeId],
            });
        },
    });
}
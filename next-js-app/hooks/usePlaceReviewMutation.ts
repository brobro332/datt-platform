import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createPlaceReview, updatePlaceReview, deletePlaceReview } from "@/services/reviewService";

import type { PlaceReviewCreateRequest, PlaceReviewUpdateRequest } from "@/types/review";

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

export function useUpdatePlaceReview(placeId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId, request }: { reviewId: number; request: PlaceReviewUpdateRequest }) =>
            updatePlaceReview(placeId, reviewId, request),

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

export function useDeletePlaceReview(placeId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reviewId: number) =>
            deletePlaceReview(placeId, reviewId),

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
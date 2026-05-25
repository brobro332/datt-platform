import { apiClient } from "@/lib/apiClient";

import type { PlaceReviewCreateRequest, PlaceReviewResponse } from "@/types/review";
import type { PageResponse, ApiResponse } from "@/types/api";

export async function getPlaceReviews(
    placeId: number,
): Promise<PageResponse<PlaceReviewResponse>> {
    const response = await apiClient.get<
        ApiResponse<PageResponse<PlaceReviewResponse>>
    >(`/api/places/${placeId}/reviews`);

    return response.data.data;
}

export async function createPlaceReview(
    placeId: number,
    request: PlaceReviewCreateRequest,
): Promise<PlaceReviewResponse> {
    const response = await apiClient.post<
        ApiResponse<PlaceReviewResponse>
    >(`/api/places/${placeId}/reviews`, request);

    return response.data.data;
}
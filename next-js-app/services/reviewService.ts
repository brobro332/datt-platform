import { apiClient } from "@/lib/apiClient";
import type { PlaceReviewCreateRequest, PlaceReviewResponse, PlaceReviewUpdateRequest } from "@/types/review";
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

export async function updatePlaceReview(
    placeId: number,
    reviewId: number,
    request: PlaceReviewUpdateRequest,
): Promise<PlaceReviewResponse> {
    const response = await apiClient.patch<
        ApiResponse<PlaceReviewResponse>
    >(`/api/places/${placeId}/reviews/${reviewId}`, request);

    return response.data.data;
}

export async function deletePlaceReview(
    placeId: number,
    reviewId: number,
): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/api/places/${placeId}/reviews/${reviewId}`);
}
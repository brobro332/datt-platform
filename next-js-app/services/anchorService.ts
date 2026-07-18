import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type {
    AnchorCreateRequest,
    AnchorDetailResponse,
} from "@/types/anchor";
import type { PlaceNearbyResponse } from "@/types/place";

export type AnchorPlaceCategory = 'FOOD' | 'CAFE' | 'BAR' | 'STAY' | 'PLAY';

export type RecommendationResponse = Record<AnchorPlaceCategory, PlaceNearbyResponse[]>;

export async function createAnchor(
    request: AnchorCreateRequest,
): Promise<AnchorDetailResponse> {
    const response = await apiClient.post<
        ApiResponse<AnchorDetailResponse>
    >("/api/anchors", request);

    return response.data.data;
}

export async function getRecommendations(
    params: { 
        lat?: number; 
        lon?: number; 
        radiusKm?: number;
        province?: string;
        district?: string;
    },
): Promise<RecommendationResponse> {
    const response = await apiClient.get<
        ApiResponse<RecommendationResponse>
    >("/api/anchors/recommendations", { params });

    return response.data.data;
}

export async function getAnchorDetail(
    anchorId: number,
): Promise<AnchorDetailResponse> {
    const response = await apiClient.get<
        ApiResponse<AnchorDetailResponse>
    >(`/api/anchors/${anchorId}`);

    return response.data.data;
}

export async function deleteAnchor(
    anchorId: number,
): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/api/anchors/${anchorId}`);
}

export async function updateAnchorPlaces(
    anchorId: number,
    placeIds: number[],
): Promise<AnchorDetailResponse> {
    const response = await apiClient.put<ApiResponse<AnchorDetailResponse>>(
        `/api/anchors/${anchorId}/places`,
        placeIds
    );
    return response.data.data;
}

export async function changeAnchorVisibility(
    anchorId: number,
    isPublic: boolean,
): Promise<void> {
    await apiClient.patch<ApiResponse<void>>(`/api/anchors/${anchorId}/visibility`, null, {
        params: { isPublic },
    });
}

export async function changeAnchorTitle(
    anchorId: number,
    title: string,
): Promise<void> {
    await apiClient.patch<ApiResponse<void>>(`/api/anchors/${anchorId}/title`, null, {
        params: { title },
    });
}

export type AnchorSortType = "LATEST" | "POPULAR";

export type PageResponse<T> = {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type AnchorSummaryResponse = {
  anchorId: number;
  title: string;
  basePlaceName: string | null;
  baseAddress: string | null;
  baseLon: number | null;
  baseLat: number | null;
  radiusKm: number | null;
  viewCount: number;
  placeCount: number;
  likeCount: number;
  isLike: boolean;
  creatorNickname?: string | null;
  creatorTitleName?: string | null;
  createdAt: string;
};

export async function getPublicAnchors(params: {
  sortType?: AnchorSortType;
  page?: number;
  size?: number;
}): Promise<PageResponse<AnchorSummaryResponse>> {
  const response = await apiClient.get<ApiResponse<PageResponse<AnchorSummaryResponse>>>("/api/anchors", {
    params,
  });
  return response.data.data;
}

export async function getMyAnchors(params: {
  sortType?: AnchorSortType;
  page?: number;
  size?: number;
}): Promise<PageResponse<AnchorSummaryResponse>> {
  const response = await apiClient.get<ApiResponse<PageResponse<AnchorSummaryResponse>>>("/api/my/anchors", {
    params,
  });
  return response.data.data;
}

export async function likeAnchor(anchorId: number): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`/api/anchors/${anchorId}/likes`);
}

export async function unlikeAnchor(anchorId: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/api/anchors/${anchorId}/likes`);
}
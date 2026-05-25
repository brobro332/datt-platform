import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type {
    AnchorCreateRequest,
    AnchorDetailResponse,
} from "@/types/anchor";

export async function createAnchor(
    request: AnchorCreateRequest,
): Promise<AnchorDetailResponse> {
    const response = await apiClient.post<
        ApiResponse<AnchorDetailResponse>
    >("/api/anchors", request);

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
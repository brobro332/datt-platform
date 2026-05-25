import { apiClient } from "@/lib/apiClient";

import type { ApiResponse } from "@/types/api";
import type { MemberTitleResponse } from "@/types/title";

export async function getMyTitles(): Promise<MemberTitleResponse[]> {
    const response = await apiClient.get<
        ApiResponse<MemberTitleResponse[]>
    >("/api/my/titles");

    return response.data.data;
}

export async function selectMyTitle(
    titleId: number,
): Promise<MemberTitleResponse> {
    const response = await apiClient.patch<
        ApiResponse<MemberTitleResponse>
    >(`/api/my/titles/${titleId}/select`);

    return response.data.data;
}
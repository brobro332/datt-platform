import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { MemberProfileResponse } from "@/types/member";

export async function getMyProfile(): Promise<MemberProfileResponse> {
    const response = await apiClient.get<ApiResponse<MemberProfileResponse>>(
        "/api/my/profile",
    );

    return response.data.data;
}
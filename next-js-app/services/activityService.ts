import { apiClient } from "@/lib/apiClient";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { MemberActivityLogResponse } from "@/types/activity";

export async function getMyActivityLogs(
    page = 0,
    size = 10,
): Promise<PageResponse<MemberActivityLogResponse>> {
    const response = await apiClient.get<
        ApiResponse<PageResponse<MemberActivityLogResponse>>
    >("/api/my/activity-logs", {
        params: {
            page,
            size,
        },
    });

    return response.data.data;
}
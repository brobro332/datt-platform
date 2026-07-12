import { apiClient } from "@/lib/apiClient";

import type { ApiResponse } from "@/types/api";
import type { MemberAchievementResponse } from "@/types/achievement";

export async function getMyAchievements(): Promise<
    MemberAchievementResponse[]
> {
    const response = await apiClient.get<
        ApiResponse<MemberAchievementResponse[]>
    >("/api/my/achievements");

    return response.data.data;
}
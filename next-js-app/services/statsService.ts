import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";

export type PlatformStatsResponse = {
  placeCount: number;
  anchorCount: number;
  reviewCount: number;
  averageRating: number;
};

export async function getPlatformStats(): Promise<PlatformStatsResponse> {
  const response = await apiClient.get<ApiResponse<PlatformStatsResponse>>("/api/stats");
  return response.data.data;
}

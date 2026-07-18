import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";

export type AdResponse = {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string;
  status: string;
  createdAt: string;
};

export type AdCreateRequest = {
  title: string;
  imageUrl: string;
  linkUrl: string;
};

export async function getAdsByAdmin(): Promise<AdResponse[]> {
  const response = await apiClient.get<ApiResponse<AdResponse[]>>(
    "/api/admin/ads"
  );
  return response.data.data;
}

export async function createAdByAdmin(
  adData: AdCreateRequest
): Promise<AdResponse> {
  const response = await apiClient.post<ApiResponse<AdResponse>>(
    "/api/admin/ads",
    adData
  );
  return response.data.data;
}

export async function deleteAdByAdmin(adId: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/admin/ads/${adId}`);
}

export async function uploadAdImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("dir", "ads");

  const response = await apiClient.post<ApiResponse<string>>(
    "/api/files/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.data;
}

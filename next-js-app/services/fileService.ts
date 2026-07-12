import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";

export async function uploadFile(file: File, directory = "general"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("dir", directory);

  const response = await apiClient.post<ApiResponse<string>>("/api/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
}

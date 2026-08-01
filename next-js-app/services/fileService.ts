import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import imageCompression from "browser-image-compression";

export async function uploadFile(file: File, directory = "general"): Promise<string> {
  let finalFile = file;

  // Compress image if it's an image file
  if (file.type.startsWith("image/")) {
    const options = {
      maxSizeMB: 1, // Maximum file size of 1MB
      maxWidthOrHeight: 1920, // Max width/height
      useWebWorker: true,
    };
    try {
      finalFile = await imageCompression(file, options);
    } catch (error) {
      console.error("Image compression error:", error);
      // Fallback to original file if compression fails
    }
  }

  const formData = new FormData();
  formData.append("file", finalFile);
  formData.append("dir", directory);

  const response = await apiClient.post<ApiResponse<string>>("/api/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
}

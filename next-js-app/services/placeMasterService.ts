import { apiClient } from "@/lib/apiClient";
import type { ApiResponse, SliceResponse } from "@/types/api";
import type { PlaceMasterSearchResponse, SubwayStationResponse } from "@/types/placeMaster";

export async function searchPlaceMasters(
  keyword?: string,
  province?: string,
  district?: string,
  category?: string,
  page?: number,
  size?: number,
) {
  const params: Record<string, any> = {};
  if (keyword) params.keyword = keyword;
  if (province) params.province = province;
  if (district) params.district = district;
  if (category) params.category = category;
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;

  const response = await apiClient.get<ApiResponse<SliceResponse<PlaceMasterSearchResponse>>>(
    "/api/place-masters",
    { params },
  );

  return response.data.data;
}

export async function getProvinces() {
  const response = await apiClient.get<ApiResponse<string[]>>("/api/place-masters/provinces");
  return response.data.data;
}

export async function getDistricts(province: string) {
  const response = await apiClient.get<ApiResponse<string[]>>("/api/place-masters/districts", {
    params: { province },
  });
  return response.data.data;
}

export async function getRegionCenter(province: string, district: string) {
  const response = await apiClient.get<ApiResponse<[number, number]>>(
    "/api/place-masters/region-center",
    {
      params: { province, district },
    },
  );
  return response.data.data;
}

export async function getSubwayStations(province?: string | null, district?: string | null) {
  const params: Record<string, string> = {};
  if (province) params.province = province;
  if (district) params.district = district;

  const response = await apiClient.get<ApiResponse<SubwayStationResponse[]>>("/api/subway-stations", {
    params,
  });
  return response.data.data;
}
import { apiClient } from "@/lib/apiClient";

import type {
  NearbyPlaceSearchParams,
  PlaceDetailResponse,
  PlaceSearchParams,
  PlaceSearchResponse,
  GeocodingResponse,
  PlaceCreateRequest,
} from "@/types/place";

import type {
  ApiResponse,
  PageResponse,
} from "@/types/api";

export async function searchPlaces(
  params: PlaceSearchParams,
): Promise<PageResponse<PlaceSearchResponse>> {
  const response = await apiClient.get<
    ApiResponse<PageResponse<PlaceSearchResponse>>
  >("/api/places", {
    params,
  });

  return response.data.data;
}

export async function getPlaceDetail(
  placeId: number,
): Promise<PlaceDetailResponse> {
  const response = await apiClient.get<
    ApiResponse<PlaceDetailResponse>
  >(`/api/places/${placeId}`);

  return response.data.data;
}

export async function searchNearbyPlaces(
  params: NearbyPlaceSearchParams,
): Promise<PageResponse<PlaceSearchResponse>> {
  const response = await apiClient.get<
    ApiResponse<PageResponse<PlaceSearchResponse>>
  >("/api/places/nearby", {
    params: {
      lat: params.lat,
      lon: params.lon,
      radiusKm: params.radiusKm ?? 3,
      category: params.category,
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  });

  return response.data.data;
}

export async function geocodeAddress(
  address: string,
): Promise<GeocodingResponse> {
  const response = await apiClient.get<
    ApiResponse<GeocodingResponse>
  >("/api/admin/places/geocode", {
    params: { address },
  });

  return response.data.data;
}

export async function createPlaceByAdmin(
  placeData: PlaceCreateRequest,
): Promise<PlaceDetailResponse> {
  const response = await apiClient.post<
    ApiResponse<PlaceDetailResponse>
  >("/api/admin/places", placeData);

  return response.data.data;
}
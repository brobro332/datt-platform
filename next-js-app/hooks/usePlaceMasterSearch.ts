import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

import {
  searchPlaceMasters,
  getProvinces,
  getDistricts,
  getRegionCenter,
  getSubwayStations,
} from "@/services/placeMasterService";

type UsePlaceMasterSearchParams = {
  keyword?: string;
  province?: string;
  district?: string;
  category?: string;
  enabled?: boolean;
};

export function usePlaceMasterSearch({
  keyword,
  province,
  district,
  category,
  enabled = true,
}: UsePlaceMasterSearchParams) {
  return useInfiniteQuery({
    queryKey: ["place-masters", keyword, province, district, category],
    queryFn: ({ pageParam = 0 }) =>
      searchPlaceMasters(keyword, province, district, category, pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (!lastPage.last ? lastPage.number + 1 : undefined),
    enabled:
      enabled &&
      ((keyword !== undefined && keyword.trim().length > 0) ||
        (province !== undefined && district !== undefined)),
  });
}

export function useProvinces() {
  return useQuery({
    queryKey: ["place-masters", "provinces"],
    queryFn: getProvinces,
  });
}

export function useDistricts(province: string | null) {
  return useQuery({
    queryKey: ["place-masters", "districts", province],
    queryFn: () => getDistricts(province!),
    enabled: !!province,
  });
}

export function useRegionCenter(params: {
  province: string | null;
  district: string | null;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["place-masters", "region-center", params.province, params.district],
    queryFn: () => getRegionCenter(params.province!, params.district!),
    enabled: !!(params.enabled && params.province && params.district),
  });
}

export function useSubwayStations(params?: {
  province?: string | null;
  district?: string | null;
}) {
  const province = params?.province || null;
  const district = params?.district || null;
  return useQuery({
    queryKey: ["place-masters", "subway-stations", province, district],
    queryFn: () => getSubwayStations(province, district),
  });
}
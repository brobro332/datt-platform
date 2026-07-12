import { useQuery } from "@tanstack/react-query";
import { getRecommendations } from "@/services/anchorService";

export function useAnchorRecommendations(params: {
  lat?: number | null;
  lon?: number | null;
  radiusKm?: number;
  province?: string | null;
  district?: string | null;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["anchor-recommendations", params.lat, params.lon, params.radiusKm, params.province, params.district],
    queryFn: () =>
      getRecommendations({
        lat: params.lat ?? undefined,
        lon: params.lon ?? undefined,
        radiusKm: params.radiusKm,
        province: params.province ?? undefined,
        district: params.district ?? undefined,
      }),
    enabled: !!(
      params.enabled && 
      ((params.lat !== undefined && params.lat !== null && params.lon !== undefined && params.lon !== null) || 
       (params.province && params.district))
    ),
  });
}

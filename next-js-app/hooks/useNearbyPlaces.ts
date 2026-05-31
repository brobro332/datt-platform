import { useQuery } from "@tanstack/react-query";

import { searchNearbyPlaces } from "@/services/placeService";

type UseNearbyPlacesParams = {
  lat?: number;
  lon?: number;
  radiusKm?: number;
  page?: number;
  size?: number;
};

export function useNearbyPlaces({
  lat,
  lon,
  radiusKm = 3,
  page = 0,
  size = 20,
}: UseNearbyPlacesParams) {
  return useQuery({
    queryKey: [
      "nearby-places",
      lat,
      lon,
      radiusKm,
      page,
      size,
    ],

    queryFn: () =>
      searchNearbyPlaces({
        lat: lat!,
        lon: lon!,
        radiusKm,
        page,
        size,
      }),

    enabled:
      lat !== undefined &&
      lon !== undefined,
  });
}
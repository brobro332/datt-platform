import { useQuery } from "@tanstack/react-query";

import { searchNearbyPlaces } from "@/services/placeService";

type UseNearbyPlacesParams = {
  lat?: number;
  lon?: number;
  radiusKm?: number;
  category?: string;
  page?: number;
  size?: number;
};

export function useNearbyPlaces({
  lat,
  lon,
  radiusKm = 3,
  category,
  page = 0,
  size = 20,
}: UseNearbyPlacesParams) {
  return useQuery({
    queryKey: [
      "nearby-places",
      lat,
      lon,
      radiusKm,
      category,
      page,
      size,
    ],

    queryFn: () =>
      searchNearbyPlaces({
        lat: lat!,
        lon: lon!,
        radiusKm,
        category,
        page,
        size,
      }),

    enabled:
      lat !== undefined &&
      lon !== undefined,
  });
}
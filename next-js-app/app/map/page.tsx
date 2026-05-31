"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { MainLayout } from "@/layouts/MainLayout";

import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";

import { MapContainer } from "@/components/map/MapContainer";
import { PlaceListItem } from "@/components/place/PlaceListItem";

import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";

import type {
  PlaceSearchResponse,
} from "@/types/place";

const DEFAULT_LAT = 37.5665;
const DEFAULT_LON = 126.9780;

export default function MapPage() {
  const [currentLat, setCurrentLat] =
    useState<number>();

  const [currentLon, setCurrentLon] =
    useState<number>();

  const [selectedPlace, setSelectedPlace] =
    useState<PlaceSearchResponse | null>(
      null,
    );

  const [sortBy, setSortBy] = useState<
    "distance" | "name"
  >("distance");

  useEffect(() => {
    if (!navigator.geolocation) {
      setCurrentLat(DEFAULT_LAT);
      setCurrentLon(DEFAULT_LON);

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLat(
          position.coords.latitude,
        );

        setCurrentLon(
          position.coords.longitude,
        );
      },

      () => {
        setCurrentLat(DEFAULT_LAT);
        setCurrentLon(DEFAULT_LON);
      },
    );
  }, []);

  const {
    data,
    isLoading,
    isError,
  } = useNearbyPlaces({
    lat: currentLat,
    lon: currentLon,
    radiusKm: 3,
    size: 30,
  });

  function getDistanceMeter(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371000;
    const toRad = (value: number) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDistance(meter: number) {
    if (meter < 1000) {
      return `약 ${Math.round(meter)}m`;
    }

    return `약 ${(meter / 1000).toFixed(1)}km`;
  }

  const places = useMemo(() => {
    if (
      currentLat === undefined ||
      currentLon === undefined
    ) {
      return data?.content ?? [];
    }

    const content = [...(data?.content ?? [])];

    if (sortBy === "distance") {
      return content.sort((a, b) => {
        const distanceA = getDistanceMeter(
          currentLat,
          currentLon,
          a.lat,
          a.lon,
        );

        const distanceB = getDistanceMeter(
          currentLat,
          currentLon,
          b.lat,
          b.lon,
        );

        return distanceA - distanceB;
      });
    }

    return content.sort((a, b) =>
      a.bizesNm.localeCompare(
        b.bizesNm,
        "ko",
      ),
    );
  }, [
    data,
    sortBy,
    currentLat,
    currentLon,
  ]);

  if (
    currentLat === undefined ||
    currentLon === undefined
  ) {
    return (
      <MainLayout>
        <LoadingState message="현재 위치를 불러오는 중입니다..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Nearby Places
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                내 주변 탐색
              </h1>
            </div>

            <div className="flex rounded-2xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setSortBy("distance")}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  sortBy === "distance"
                    ? "bg-white text-gray-950 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                거리순
              </button>

              <button
                type="button"
                onClick={() => setSortBy("name")}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  sortBy === "name"
                    ? "bg-white text-gray-950 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                이름순
              </button>
            </div>
          </div>

          {isLoading && (
            <LoadingState message="주변 장소를 불러오는 중입니다..." />
          )}

          {isError && (
            <ErrorState
              title="주변 장소 조회 실패"
              message="주변 장소 정보를 불러오지 못했습니다."
            />
          )}

          {!isLoading &&
            !isError &&
            places.length === 0 && (
              <div className="rounded-3xl border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-600">
                  주변 장소가 없습니다.
                </p>
              </div>
            )}

          {!isLoading &&
            !isError &&
            places.length > 0 && (
              <ul className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
                {places.map((place) => (
                  <PlaceListItem
                    key={place.id}
                    place={place}
                    onClick={() =>
                      setSelectedPlace(place)
                    }
                  />
                ))}
              </ul>
            )}
        </section>

        <section className="sticky top-24 h-[800px] overflow-hidden rounded-3xl border border-gray-200">
          <MapContainer
            places={places}
            selectedPlace={
              selectedPlace
            }
            currentLat={currentLat}
            currentLon={currentLon}
            onSelectPlace={
              setSelectedPlace
            }
          />

          {selectedPlace && (
            <div className="absolute bottom-5 left-5 right-5 z-10 rounded-3xl bg-white p-5 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-600">
                    {selectedPlace.indsMclsNm}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-gray-950">
                    {selectedPlace.bizesNm}
                    {selectedPlace.brchNm && (
                      <span className="ml-2 text-base font-medium text-gray-500">
                        {selectedPlace.brchNm}
                      </span>
                    )}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedPlace(null)}
                  className="text-sm text-gray-400 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-400">
                    도로명주소
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {selectedPlace.rdnmAdr}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400">
                    지번주소
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {selectedPlace.ctprvnNm}{" "}
                    {selectedPlace.signguNm}{" "}
                    {selectedPlace.adongNm}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400">
                    거리
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {formatDistance(
                      getDistanceMeter(
                        currentLat,
                        currentLon,
                        selectedPlace.lat,
                        selectedPlace.lon,
                      ),
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          
        </section>
      </section>
    </MainLayout>
  );
}
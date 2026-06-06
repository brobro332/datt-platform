"use client";

import { useEffect, useRef, useState } from "react";
import { env } from "@/lib/env";
import type { PlaceSearchResponse } from "@/types/place";

type MapContainerProps = {
  places: PlaceSearchResponse[];
  selectedPlace: PlaceSearchResponse | null;
  currentLat: number;
  currentLon: number;
  centerTrigger: number;
  onSelectPlace?: (place: PlaceSearchResponse) => void;
};

export function MapContainer({
  places,
  selectedPlace,
  currentLat,
  currentLon,
  centerTrigger,
  onSelectPlace,
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const placeMarkersRef = useRef<kakao.maps.Marker[]>([]);
  const currentOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) {
      return;
    }

    function createMap() {
      if (!mapRef.current || mapInstanceRef.current) {
        return;
      }

      const center = new window.kakao.maps.LatLng(currentLat, currentLon);
      const map = new window.kakao.maps.Map(mapRef.current, {
        center,
        level: 4,
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);
    }

    if (window.kakao?.maps) {
      window.kakao.maps.load(createMap);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${env.kakaoMapAppKey}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(createMap);
    };

    document.head.appendChild(script);
  }, [currentLat, currentLon]);

  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!isMapReady || !map) {
      return;
    }

    const currentPosition = new window.kakao.maps.LatLng(currentLat, currentLon);

    currentOverlayRef.current?.setMap(null);

    currentOverlayRef.current = new window.kakao.maps.CustomOverlay({
      map,
      position: currentPosition,
      yAnchor: 0.5,
      content: `
        <div style="
          width:18px;
          height:18px;
          border-radius:50%;
          background:#ef4444;
          border:3px solid white;
          box-shadow:0 0 0 6px rgba(239,68,68,0.25);
        "></div>
      `,
    });
  }, [isMapReady, currentLat, currentLon]);

  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!isMapReady || !map) {
      return;
    }

    placeMarkersRef.current.forEach((marker) => marker.setMap(null));
    placeMarkersRef.current = [];

    places.forEach((place) => {
      if (!Number.isFinite(place.lat) || !Number.isFinite(place.lon)) {
        return;
      }

      const position = new window.kakao.maps.LatLng(place.lat, place.lon);

      const marker = new window.kakao.maps.Marker({
        map,
        position,
        title: place.bizesNm,
      });

      window.kakao.maps.event.addListener(marker, "click", () => {
        onSelectPlace?.(place);
      });

      placeMarkersRef.current.push(marker);
    });

    return () => {
      placeMarkersRef.current.forEach((marker) => marker.setMap(null));
      placeMarkersRef.current = [];
    };
  }, [isMapReady, places, onSelectPlace]);

  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) {
      return;
    }

    const currentPosition = new window.kakao.maps.LatLng(currentLat, currentLon);
    mapInstanceRef.current.setCenter(currentPosition);
  }, [isMapReady, centerTrigger, currentLat, currentLon]);

  useEffect(() => {
    if (!isMapReady || !selectedPlace || !mapInstanceRef.current) {
      return;
    }

    const position = new window.kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lon);
    mapInstanceRef.current.setCenter(position);
  }, [isMapReady, selectedPlace]);

  return <div ref={mapRef} className="h-full w-full" />;
}
import { BookmarkFolder } from "./bookmark";

export type PlaceSearchResponse = {
  id: number;
  bizesNm: string;
  brchNm: string | null;
  indsMclsCd: string;
  indsMclsNm: string;
  ctprvnNm: string;
  signguNm: string;
  adongNm: string;
  rdnmAdr: string;
  lon: number;
  lat: number;
  averageRating: number;
  reviewCount: number;
  category?: string;
};

export type PlaceNearbyResponse = {
  id: number;
  bizesNm: string;
  brchNm: string | null;
  indsMclsCd: string;
  indsMclsNm: string;
  ctprvnNm: string;
  signguNm: string;
  adongNm: string;
  rdnmAdr: string;
  lon: number;
  lat: number;
  distanceKm: number;
  averageRating: number;
  reviewCount: number;
  category?: string;
};

export type PlaceSearchParams = {
  keyword?: string;
  ctprvnNm?: string;
  signguNm?: string;
  category?: string;
  sortType?: "LATEST" | "NAME" | "REVIEW_COUNT" | "RATING";
  page?: number;
  size?: number;
};

export type NearbyPlaceSearchParams = {
  lat: number;
  lon: number;
  radiusKm?: number;
  category?: string;
  page?: number;
  size?: number;
};

export type PlaceDetailResponse = {
  id: number;
  bizesId: string;

  bizesNm: string;
  brchNm: string | null;

  indsLclsCd: string;
  indsLclsNm: string;
  indsMclsCd: string;
  indsMclsNm: string;
  indsSclsCd: string;
  indsSclsNm: string;

  ctprvnNm: string;
  signguNm: string;
  adongNm: string;
  ldongNm: string;

  lnoAdr: string;
  rdnmAdr: string;
  newZipcd: string;

  lon: number;
  lat: number;

  isBookmarked: boolean;
  bookmarkFolders?: BookmarkFolder[];
  averageRating: number;
  reviewCount: number;
  imageUrl?: string | null;

  createdAt: string;
  updatedAt: string;
  category?: string;
};
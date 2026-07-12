export type PlaceMasterSearchResponse = {
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
  category?: string;
};

export type PlaceMasterResponse = {
  placeMasterId: number;
  placeName: string;
  address: string;
  lon: number;
  lat: number;
};

export type SubwayStationResponse = {
  id: number;
  name: string;
  line: string;
  province: string;
  district: string;
  lat: number;
  lon: number;
};

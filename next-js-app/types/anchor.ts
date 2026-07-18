export type AnchorCreateRequest = {
    title: string;
    basePlaceId?: number | null;
    basePlaceName?: string | null;
    baseAddress?: string | null;
    baseLon?: number | null;
    baseLat?: number | null;
    radiusKm?: number | null;
    isPublic: boolean;
    placeIds?: number[] | null;
};

export type AnchorPlaceResponse = {
    placeId: number;
    bizesNm: string;
    brchNm: string | null;
    indsMclsCd: string;
    indsMclsNm: string;
    rdnmAdr: string;
    lon: number;
    lat: number;
    distanceKm: number;
    recommendOrder: number;
    category?: string;
};

export type AnchorPlaceCategory = 'FOOD' | 'CAFE' | 'BAR' | 'STAY' | 'PLAY';

export type AnchorPlaceGroupResponse = {
    category: AnchorPlaceCategory;
    categoryName: string;
    places: AnchorPlaceResponse[];
};

export type AnchorDetailResponse = {
    anchorId: number;
    memberId: number;
    title: string;

    basePlaceName: string | null;
    baseAddress: string | null;

    baseLon: number | null;
    baseLat: number | null;
    radiusKm: number | null;

    isPublic: boolean;

    viewCount: number;

    likeCount: number;
    isLiked: boolean;

    placeGroups: AnchorPlaceGroupResponse[];

    createdAt: string;
};
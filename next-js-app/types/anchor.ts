export type AnchorCreateRequest = {
    title: string;
    basePlaceId?: number | null;
    basePlaceName?: string | null;
    baseAddress?: string | null;
    baseLon?: number | null;
    baseLat?: number | null;
    radiusKm?: number | null;
    isPublic: boolean;
};

export type AnchorDetailResponse = {
    anchorId: number;
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

    placeGroups: unknown[];

    createdAt: string;
};
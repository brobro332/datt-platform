export type PlaceReviewResponse = {
    reviewId: number;
    placeId: number;
    memberId: number;
    nickname: string;
    rating: number;
    content: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
};

export type PlaceReviewCreateRequest = {
    rating: number;
    content: string;
    imageUrl?: string;
};

export type PlaceReviewUpdateRequest = {
    rating: number;
    content: string;
    imageUrl?: string;
};
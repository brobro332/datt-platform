export type PlaceReviewResponse = {
    reviewId: number;
    placeId: number;
    memberId: number;
    nickname: string;
    rating: number;
    content: string;
    createdAt: string;
    updatedAt: string;
};

export type PlaceReviewCreateRequest = {
    rating: number;
    content: string;
};
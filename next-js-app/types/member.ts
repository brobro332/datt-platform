import { PlaceBookmarkResponse } from "./bookmark";

export type SelectedTitleResponse = {
    titleId: number;
    code: string;
    name: string;
};

export type MemberActivitySummaryResponse = {
    bookmarkCount: number;
    reviewCount: number;
    anchorCount: number;
    receivedLikeCount: number;
};

export type ProfileAnchorResponse = {
    anchorId: number;
    title: string;
    basePlaceName: string | null;
    baseAddress: string | null;
    viewCount: number;
    createdAt: string;
};

export type ProfileReviewResponse = {
    reviewId: number;
    placeId: number;
    placeName: string;
    rating: number;
    content: string;
    createdAt: string;
};

export type MemberProfileResponse = {
    memberId: number;
    email: string;
    nickname: string;

    level: number;
    exp: number;
    requiredExpForNextLevel: number;

    selectedTitle: SelectedTitleResponse | null;
    titleCount: number;
    achievementCount: number;

    activitySummary: MemberActivitySummaryResponse;

    recentAnchors: ProfileAnchorResponse[];
    recentReviews: ProfileReviewResponse[];
    recentBookmarks: PlaceBookmarkResponse[];
};
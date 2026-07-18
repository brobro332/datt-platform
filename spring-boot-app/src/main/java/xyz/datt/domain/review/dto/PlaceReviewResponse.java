package xyz.datt.domain.review.dto;

import xyz.datt.domain.review.entity.PlaceReview;

import java.time.LocalDateTime;

public record PlaceReviewResponse(
    Long reviewId,
    Long placeId,
    Long memberId,
    String nickname,
    String memberTitleName,
    int rating,
    String content,
    String imageUrl,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {

    public static PlaceReviewResponse from(PlaceReview review, String memberTitleName) {
        return new PlaceReviewResponse(
            review.getId(),
            review.getPlaceMaster().getId(),
            review.getMember().getId(),
            review.getMember().getNickname(),
            memberTitleName,
            review.getRating(),
            review.getContent(),
            review.getImageUrl(),
            review.getCreatedAt(),
            review.getUpdatedAt()
        );
    }
}
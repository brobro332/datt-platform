package xyz.datt.domain.anchor.dto;

import xyz.datt.domain.anchor.entity.Anchor;

import java.time.LocalDateTime;
import java.util.List;

public record AnchorDetailResponse(
    Long anchorId,
    Long memberId,
    String title,

    String basePlaceName,
    String baseAddress,

    Double baseLon,
    Double baseLat,
    Double radiusKm,

    boolean isPublic,

    long viewCount,

    int likeCount,
    boolean isLiked,

    List<AnchorPlaceGroupResponse> placeGroups,

    LocalDateTime createdAt
) {
    public static AnchorDetailResponse of(
        Anchor anchor,
        int likeCount,
        boolean isLiked,
        List<AnchorPlaceGroupResponse> placeGroups
    ) {
        return new AnchorDetailResponse(
            anchor.getId(),
            anchor.getMember().getId(),
            anchor.getTitle(),

            anchor.getBasePlaceName(),
            anchor.getBaseAddress(),

            anchor.getBaseLon(),
            anchor.getBaseLat(),
            anchor.getRadiusKm(),

            anchor.isPublic(),

            anchor.getViewCount(),

            likeCount,
            isLiked,

            placeGroups,

            anchor.getCreatedAt()
        );
    }
}
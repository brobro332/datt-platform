package xyz.datt.domain.anchor.dto;

import xyz.datt.domain.anchor.entity.Anchor;

import java.time.LocalDateTime;

public record AnchorSummaryResponse(
    Long anchorId,
    String title,

    String basePlaceName,
    String baseAddress,

    Double baseLon,
    Double baseLat,
    Double radiusKm,

    long viewCount,
    int placeCount,

    LocalDateTime createdAt
) {
    public static AnchorSummaryResponse from(
        Anchor anchor,
        int placeCount
    ) {
        return new AnchorSummaryResponse(
            anchor.getId(),
            anchor.getTitle(),

            anchor.getBasePlaceName(),
            anchor.getBaseAddress(),

            anchor.getBaseLon(),
            anchor.getBaseLat(),
            anchor.getRadiusKm(),

            anchor.getViewCount(),
            placeCount,

            anchor.getCreatedAt()
        );
    }
}

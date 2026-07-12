package xyz.datt.domain.stats.dto;

public record PlatformStatsResponse(
    long placeCount,
    long anchorCount,
    long reviewCount,
    double averageRating
) {}

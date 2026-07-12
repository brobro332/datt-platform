package xyz.datt.domain.place.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PlaceSortType {
    LATEST("createdAt", "최신순"),
    NAME("bizesNm", "이름순"),
    REVIEW_COUNT("reviewCount", "리뷰순"),
    RATING("averageRating", "평점순");

    private final String property;
    private final String description;
}
package xyz.datt.domain.gamification.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AchievementCode {
    FIRST_BOOKMARK("첫 장소 저장"),
    BOOKMARK_3("장소 저장 3회 달성"),
    BOOKMARK_10("장소 저장 10회 달성"),
    BOOKMARK_30("장소 저장 30회 달성"),

    FIRST_REVIEW("첫 리뷰 작성"),
    REVIEW_3("리뷰 작성 3회 달성"),
    REVIEW_10("리뷰 작성 10회 달성"),
    REVIEW_30("리뷰 작성 30회 달성"),

    FIRST_ANCHOR("첫 Anchor 생성"),
    ANCHOR_3("닻 정박 3회 달성"),
    ANCHOR_10("닻 정박 10회 달성"),
    ANCHOR_30("닻 정박 30회 달성"),

    FIRST_ANCHOR_LIKE("첫 Anchor 좋아요 획득"),
    ANCHOR_LIKE_5("닻 좋아요 5회 획득"),
    ANCHOR_LIKE_15("닻 좋아요 15회 획득"),
    ANCHOR_LIKE_50("닻 좋아요 50회 획득");

    private final String description;
}
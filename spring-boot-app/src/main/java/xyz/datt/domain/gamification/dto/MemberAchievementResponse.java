package xyz.datt.domain.gamification.dto;

import xyz.datt.domain.gamification.entity.Achievement;
import xyz.datt.domain.gamification.entity.MemberAchievement;
import java.time.LocalDateTime;

public record MemberAchievementResponse(
    Long achievementId,
    String code,
    String name,
    String description,
    int rewardExp,
    boolean achieved,
    LocalDateTime achievedAt
) {
    public static MemberAchievementResponse of(Achievement achievement, MemberAchievement memberAchievement) {
        return new MemberAchievementResponse(
            achievement.getId(),
            achievement.getCode(),
            achievement.getName(),
            achievement.getDescription(),
            achievement.getRewardExp(),
            memberAchievement != null,
            memberAchievement != null ? memberAchievement.getCreatedAt() : null
        );
    }
}

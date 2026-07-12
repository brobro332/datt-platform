package xyz.datt.domain.gamification.dto;

import xyz.datt.domain.gamification.entity.MemberActivityLog;
import java.time.LocalDateTime;

public record MemberActivityLogResponse(
    Long activityLogId,
    String activityType,
    int expAmount,
    String description,
    LocalDateTime createdAt
) {
    public static MemberActivityLogResponse from(MemberActivityLog log) {
        return new MemberActivityLogResponse(
            log.getId(),
            log.getActivityType().name(),
            log.getExpAmount(),
            log.getDescription(),
            log.getCreatedAt()
        );
    }
}

package xyz.datt.domain.gamification.dto;

import xyz.datt.domain.gamification.entity.MemberTitle;
import java.time.LocalDateTime;

public record MemberTitleResponse(
    Long titleId,
    String code,
    String name,
    String description,
    boolean selected,
    LocalDateTime acquiredAt
) {
    public static MemberTitleResponse from(MemberTitle memberTitle) {
        return new MemberTitleResponse(
            memberTitle.getTitle().getId(),
            memberTitle.getTitle().getCode(),
            memberTitle.getTitle().getName(),
            memberTitle.getTitle().getDescription(),
            memberTitle.isSelected(),
            memberTitle.getCreatedAt()
        );
    }
}

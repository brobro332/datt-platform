package xyz.datt.domain.member.dto;

import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.entity.MemberRole;
import java.time.LocalDateTime;

public record MemberAdminResponse(
    Long id,
    String email,
    String nickname,
    MemberRole role,
    int level,
    int exp,
    LocalDateTime createdAt
) {
    public static MemberAdminResponse from(Member member) {
        return new MemberAdminResponse(
            member.getId(),
            member.getEmail(),
            member.getNickname(),
            member.getRole(),
            member.getLevel(),
            member.getExp(),
            member.getCreatedAt()
        );
    }
}

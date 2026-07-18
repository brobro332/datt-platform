package xyz.datt.domain.auth.dto;

public record SocialLoginResponse(
    String accessToken,
    String refreshToken,
    Long memberId,
    String nickname,
    Boolean isNewMember,
    String role
) {}

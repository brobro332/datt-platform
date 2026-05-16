package xyz.datt.domain.auth.dto;

public record LoginResponse(
        String accessToken,
        Long memberId,
        String nickname
) {
}
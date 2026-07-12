package xyz.datt.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record SocialLoginRequest(
    @NotBlank(message = "인가 코드는 필수 입력값입니다.")
    String code
) {}

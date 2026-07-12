package xyz.datt.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EmailVerifyRequest(
    @NotBlank(message = "이메일은 필수 입력값입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    String email,

    @NotBlank(message = "인증번호는 필수 입력값입니다.")
    @Size(min = 6, max = 6, message = "인증번호는 6자리 숫자입니다.")
    String code
) {}

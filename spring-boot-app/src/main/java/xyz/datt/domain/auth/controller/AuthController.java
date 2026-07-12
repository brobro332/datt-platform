package xyz.datt.domain.auth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.auth.dto.*;
import xyz.datt.domain.auth.service.AuthService;
import xyz.datt.domain.auth.service.EmailService;
import xyz.datt.domain.auth.service.SocialAuthService;
import xyz.datt.global.response.ApiResponse;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final EmailService emailService;
    private final SocialAuthService socialAuthService;

    @PostMapping("/api/auth/email/send")
    public ApiResponse<Void> sendEmail(@Valid @RequestBody EmailSendRequest request) {
        emailService.sendVerificationCode(request.email());
        return ApiResponse.success(null);
    }

    @PostMapping("/api/auth/email/verify")
    public ApiResponse<Void> verifyEmail(@Valid @RequestBody EmailVerifyRequest request) {
        authService.verifyEmailCode(request.email(), request.code());
        return ApiResponse.success(null);
    }

    @PostMapping("/api/auth/social/kakao")
    public ApiResponse<SocialLoginResponse> loginKakao(@Valid @RequestBody SocialLoginRequest request) {
        return ApiResponse.success(socialAuthService.loginKakao(request.code()));
    }

    @PostMapping("/api/auth/social/naver")
    public ApiResponse<SocialLoginResponse> loginNaver(@Valid @RequestBody SocialLoginRequest request) {
        return ApiResponse.success(socialAuthService.loginNaver(request.code()));
    }

    @PostMapping("/api/auth/signup")
    public ApiResponse<SignupResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ApiResponse.success(authService.signup(request));
    }

    @PostMapping("/api/auth/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @PostMapping("/api/auth/reissue")
    public ApiResponse<TokenReissueResponse> reissue(@Valid @RequestBody TokenReissueRequest request) {
        return ApiResponse.success(authService.reissue(request));
    }

    @PostMapping("/api/auth/logout")
    public ApiResponse<Void> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request);

        return ApiResponse.success(null);
    }

    @GetMapping("/api/auth/check-email")
    public ApiResponse<Void> checkEmail(@RequestParam String email) {
        authService.checkEmailDuplicate(email);
        return ApiResponse.success(null);
    }

    @GetMapping("/api/auth/check-nickname")
    public ApiResponse<Void> checkNickname(@RequestParam String nickname) {
        authService.checkNicknameDuplicate(nickname);
        return ApiResponse.success(null);
    }
}
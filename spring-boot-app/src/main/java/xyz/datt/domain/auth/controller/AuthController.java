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

/**
 * 회원 가입, 로그인, 로그아웃, 토큰 재발급, 이메일 인증 등
 * 전반적인 인증(Authentication) 및 인가(Authorization) 도메인의 API 요청을 처리하는 컨트롤러입니다.
 */
@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final EmailService emailService;
    private final SocialAuthService socialAuthService;

    /**
     * 회원 가입 등을 위해 이메일 인증 코드를 발송합니다.
     * EmailService를 호출하여 해당 이메일로 6자리 인증 코드를 전송합니다.
     *
     * @param request 발송할 이메일 주소 정보
     * @return 빈 성공 응답
     */
    @PostMapping("/api/auth/email/send")
    public ApiResponse<Void> sendEmail(@Valid @RequestBody EmailSendRequest request) {
        emailService.sendVerificationCode(request.email());
        return ApiResponse.success(null);
    }

    /**
     * 사용자가 입력한 이메일 인증 코드가 정확한지 검증합니다.
     * Redis 등에 저장된 인증 코드와 일치하는지 AuthService에서 확인합니다.
     *
     * @param request 이메일 주소 및 인증 코드 정보
     * @return 빈 성공 응답
     */
    @PostMapping("/api/auth/email/verify")
    public ApiResponse<Void> verifyEmail(@Valid @RequestBody EmailVerifyRequest request) {
        authService.verifyEmailCode(request.email(), request.code());
        return ApiResponse.success(null);
    }

    /**
     * 카카오(Kakao) 소셜 로그인을 처리합니다.
     * OAuth2 인가 코드를 받아 소셜 로그인 서비스를 통해 플랫폼 자체 토큰(JWT) 등을 발급합니다.
     *
     * @param request 카카오에서 반환된 인가 코드(Code)
     * @return 발급된 JWT 토큰 및 회원 정보
     */
    @PostMapping("/api/auth/social/kakao")
    public ApiResponse<SocialLoginResponse> loginKakao(@Valid @RequestBody SocialLoginRequest request) {
        return ApiResponse.success(socialAuthService.loginKakao(request.code()));
    }

    /**
     * 네이버(Naver) 소셜 로그인을 처리합니다.
     * OAuth2 인가 코드를 받아 소셜 로그인 서비스를 통해 플랫폼 자체 토큰(JWT) 등을 발급합니다.
     *
     * @param request 네이버에서 반환된 인가 코드(Code)
     * @return 발급된 JWT 토큰 및 회원 정보
     */
    @PostMapping("/api/auth/social/naver")
    public ApiResponse<SocialLoginResponse> loginNaver(@Valid @RequestBody SocialLoginRequest request) {
        return ApiResponse.success(socialAuthService.loginNaver(request.code()));
    }

    /**
     * 이메일 기반의 일반 회원가입을 처리합니다.
     * AuthService를 통해 유저 정보를 데이터베이스에 저장합니다.
     *
     * @param request 회원가입에 필요한 정보 (이메일, 비밀번호, 닉네임 등)
     * @return 가입 완료된 회원 식별자 응답
     */
    @PostMapping("/api/auth/signup")
    public ApiResponse<SignupResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ApiResponse.success(authService.signup(request));
    }

    /**
     * 이메일 기반의 일반 로그인을 처리합니다.
     * AuthService를 통해 비밀번호 검증 후, JWT(Access, Refresh 토큰)를 발급하여 반환합니다.
     *
     * @param request 로그인에 필요한 정보 (이메일, 비밀번호)
     * @return 발급된 JWT 토큰 정보
     */
    @PostMapping("/api/auth/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    /**
     * 만료된 Access 토큰을 갱신하기 위해 Refresh 토큰으로 재발급을 요청합니다.
     * AuthService에서 Refresh 토큰의 유효성을 검사한 뒤 새로운 토큰을 발급합니다.
     *
     * @param request 기존에 발급받은 Refresh 토큰 정보
     * @return 새로 발급된 Access 토큰과 갱신된 Refresh 토큰
     */
    @PostMapping("/api/auth/reissue")
    public ApiResponse<TokenReissueResponse> reissue(@Valid @RequestBody TokenReissueRequest request) {
        return ApiResponse.success(authService.reissue(request));
    }

    /**
     * 로그아웃 처리를 수행합니다.
     * 사용자의 Refresh 토큰을 무효화(Redis 삭제 등) 처리합니다.
     *
     * @param request 무효화할 Refresh 토큰 정보
     * @return 빈 성공 응답
     */
    @PostMapping("/api/auth/logout")
    public ApiResponse<Void> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request);

        return ApiResponse.success(null);
    }

    /**
     * 회원가입 시 이메일의 중복 여부를 확인합니다.
     * 중복일 경우 AuthService 내에서 예외가 발생하여 Error Response가 반환됩니다.
     *
     * @param email 중복 확인할 이메일 주소
     * @return 빈 성공 응답 (중복되지 않을 때)
     */
    @GetMapping("/api/auth/check-email")
    public ApiResponse<Void> checkEmail(@RequestParam String email) {
        authService.checkEmailDuplicate(email);
        return ApiResponse.success(null);
    }

    /**
     * 회원가입 시 닉네임의 중복 여부를 확인합니다.
     * 중복일 경우 AuthService 내에서 예외가 발생하여 Error Response가 반환됩니다.
     *
     * @param nickname 중복 확인할 닉네임
     * @return 빈 성공 응답 (중복되지 않을 때)
     */
    @GetMapping("/api/auth/check-nickname")
    public ApiResponse<Void> checkNickname(@RequestParam String nickname) {
        authService.checkNicknameDuplicate(nickname);
        return ApiResponse.success(null);
    }
}
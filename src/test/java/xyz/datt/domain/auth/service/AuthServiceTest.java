package xyz.datt.domain.auth.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.auth.dto.LoginRequest;
import xyz.datt.domain.auth.dto.LoginResponse;
import xyz.datt.domain.auth.dto.SignupRequest;
import xyz.datt.domain.auth.dto.SignupResponse;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.repository.MemberRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Transactional
@SpringBootTest
@ActiveProfiles("test")
class AuthServiceTest {
    @Autowired
    private AuthService authService;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("회원가입에 성공한다.")
    void givenSignupRequest_whenSignup_thenSuccess() {
        SignupRequest request = new SignupRequest(
            "test@datt.xyz",
            "password123",
            "테스트유저"
        );

        SignupResponse response = authService.signup(request);

        assertThat(response.memberId()).isNotNull();
        assertThat(response.email()).isEqualTo("test@datt.xyz");
        assertThat(response.nickname()).isEqualTo("테스트유저");
    }

    @Test
    @DisplayName("중복된 이메일이면 회원가입에 실패한다.")
    void givenDuplicatedEmail_whenSignup_thenThrowException() {
        authService.signup(new SignupRequest(
            "test@datt.xyz",
            "password123",
            "유저1"
        ));

        SignupRequest request = new SignupRequest(
            "test@datt.xyz",
            "password123",
            "유저2"
        );

        assertThatThrownBy(() -> authService.signup(request))
            .isInstanceOf(BusinessException.class)
            .extracting("errorCode")
            .isEqualTo(ErrorCode.DUPLICATED_EMAIL);
    }

    @Test
    @DisplayName("중복된 닉네임이면 회원가입에 실패한다.")
    void givenDuplicatedNickname_whenSignup_thenThrowException() {
        authService.signup(new SignupRequest(
            "user1@datt.xyz",
            "password123",
            "중복닉네임"
        ));

        SignupRequest request = new SignupRequest(
            "user2@datt.xyz",
            "password123",
            "중복닉네임"
        );

        assertThatThrownBy(() -> authService.signup(request))
            .isInstanceOf(BusinessException.class)
            .extracting("errorCode")
            .isEqualTo(ErrorCode.DUPLICATED_NICKNAME);
    }

    @Test
    @DisplayName("로그인에 성공한다.")
    void givenValidCredential_whenLogin_thenSuccess() {
        authService.signup(new SignupRequest(
            "test@datt.xyz",
            "password123",
            "테스트유저"
        ));

        LoginRequest request = new LoginRequest(
            "test@datt.xyz",
            "password123"
        );

        LoginResponse response = authService.login(request);

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.nickname()).isEqualTo("테스트유저");
    }

    @Test
    @DisplayName("존재하지 않는 이메일이면 로그인에 실패한다.")
    void givenNotFoundEmail_whenLogin_thenThrowException() {
        LoginRequest request = new LoginRequest(
            "notfound@datt.xyz",
            "password123"
        );

        assertThatThrownBy(() -> authService.login(request))
            .isInstanceOf(BusinessException.class)
            .extracting("errorCode")
            .isEqualTo(ErrorCode.INVALID_CREDENTIALS);
    }

    @Test
    @DisplayName("비밀번호가 일치하지 않으면 로그인에 실패한다.")
    void givenInvalidPassword_whenLogin_thenThrowException() {
        Member member = Member.createUser(
            "test@datt.xyz",
            passwordEncoder.encode("password123"),
            "테스트유저"
        );

        memberRepository.save(member);

        LoginRequest request = new LoginRequest(
            "test@datt.xyz",
            "wrong-password"
        );

        assertThatThrownBy(() -> authService.login(request))
            .isInstanceOf(BusinessException.class)
            .extracting("errorCode")
            .isEqualTo(ErrorCode.INVALID_CREDENTIALS);
    }
}
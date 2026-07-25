package xyz.datt.domain.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.auth.dto.*;
import xyz.datt.domain.auth.entity.EmailVerification;
import xyz.datt.domain.auth.entity.RefreshToken;
import xyz.datt.domain.auth.repository.EmailVerificationRepository;
import xyz.datt.domain.auth.repository.RefreshTokenRepository;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.repository.MemberRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;
import xyz.datt.global.security.JwtProvider;

import java.time.LocalDateTime;

/**
 * 일반 회원가입, 로그인 및 토큰 관리 등 핵심 인증/인가 비즈니스 로직을 담당하는 서비스입니다.
 * <p>
 * 비밀번호 암호화, 이메일 인증 검증, JWT 기반의 액세스 토큰 및 리프레시 토큰 발급 및
 * 갱신 프로세스를 처리합니다.
 * </p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationRepository emailVerificationRepository;

    /**
     * 일반 회원가입을 처리합니다.
     * <p>
     * 1. 이메일 및 닉네임의 중복 여부를 검사합니다.<br>
     * 2. 이메일 인증 코드가 유효한지 DB에서 검증합니다.<br>
     * 3. 전달된 평문 비밀번호를 단방향 암호화(Bcrypt 등) 처리합니다.<br>
     * 4. Member 엔티티를 생성하고 DB에 저장하여 회원가입을 완료합니다.
     * </p>
     *
     * @param request 이메일, 비밀번호, 닉네임, 인증코드를 포함한 회원가입 요청 DTO
     * @return 가입 완료된 회원의 ID, 이메일, 닉네임 정보
     */
    @Transactional
    public SignupResponse signup(SignupRequest request) {
        validateEmail(request.email());
        validateNickname(request.nickname());

        verifyEmailCode(request.email(), request.verificationCode());

        String encodedPassword = passwordEncoder.encode(request.password());

        Member member = Member.createUser(
            request.email(),
            encodedPassword,
            request.nickname()
        );

        Member savedMember = memberRepository.save(member);

        return new SignupResponse(
            savedMember.getId(),
            savedMember.getEmail(),
            savedMember.getNickname()
        );
    }

    /**
     * 일반 로그인을 처리하고 JWT 토큰을 발급합니다.
     * <p>
     * 1. 이메일로 DB에서 회원을 조회합니다.<br>
     * 2. PasswordEncoder를 사용하여 비밀번호 일치 여부를 검증합니다.<br>
     * 3. 검증 성공 시 JwtProvider를 통해 Access Token과 Refresh Token을 생성합니다.<br>
     * 4. 생성된 Refresh Token은 만료 시간과 함께 DB에 저장/갱신됩니다.
     * </p>
     *
     * @param request 이메일과 비밀번호를 포함한 로그인 요청 DTO
     * @return 발급된 Access Token, Refresh Token 및 회원 기본 정보
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        Member member = memberRepository.findByEmail(request.email())
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), member.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        String accessToken = jwtProvider.createAccessToken(
            member.getId(),
            member.getRole().name()
        );

        String refreshToken = jwtProvider.createRefreshToken(
                member.getId()
        );

        saveOrUpdateRefreshToken(
            member.getId(),
            refreshToken,
            jwtProvider.getRefreshTokenExpiredAt()
        );

        return new LoginResponse(
            accessToken,
            refreshToken,
            member.getId(),
            member.getNickname(),
            member.getRole().name()
        );
    }

    /**
     * 만료된 Access Token을 Refresh Token을 통해 재발급합니다.
     * <p>
     * 1. 요청받은 Refresh Token을 DB에서 조회하여 유효성과 만료 여부를 검증합니다.<br>
     * 2. JwtProvider를 통해 토큰 자체의 서명 및 유효성을 재확인합니다.<br>
     * 3. 확인된 회원 정보를 바탕으로 새로운 Access Token을 생성하여 반환합니다.
     * </p>
     *
     * @param request Refresh Token을 포함한 토큰 재발급 요청 DTO
     * @return 새로 발급된 Access Token 정보
     */
    @Transactional(readOnly = true)
    public TokenReissueResponse reissue(TokenReissueRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.refreshToken())
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN));

        if (refreshToken.isExpired()) {
            throw new BusinessException(ErrorCode.EXPIRED_REFRESH_TOKEN);
        }

        jwtProvider.validateToken(request.refreshToken());

        Member member = memberRepository.findById(refreshToken.getMemberId())
            .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        String accessToken = jwtProvider.createAccessToken(
            member.getId(),
            member.getRole().name()
        );

        return new TokenReissueResponse(accessToken);
    }

    /**
     * 로그아웃 처리를 수행합니다.
     * <p>
     * 사용자의 Refresh Token을 DB에서 조회한 후, 해당 데이터를 삭제하여 
     * 이후 해당 토큰으로의 재발급을 차단합니다.
     * </p>
     *
     * @param request 삭제할 Refresh Token을 포함한 로그아웃 요청 DTO
     */
    @Transactional
    public void logout(LogoutRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.refreshToken())
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN));

        refreshTokenRepository.delete(refreshToken);
    }

    /**
     * Refresh Token을 저장하거나 이미 존재하는 경우 최신 값으로 업데이트합니다.
     *
     * @param memberId 회원 ID
     * @param token 발급된 Refresh Token 문자열
     * @param expiredAt 토큰 만료 일시
     */
    private void saveOrUpdateRefreshToken(
        Long memberId,
        String token,
        LocalDateTime expiredAt
    ) {
        refreshTokenRepository.findByMemberId(memberId)
            .ifPresentOrElse(
                refreshToken -> refreshToken.updateToken(token, expiredAt),
                () -> refreshTokenRepository.save(
                    RefreshToken.create(memberId, token, expiredAt)
                )
            );
    }

    /**
     * 이메일 중복 여부를 DB에서 조회하여 검증합니다.
     *
     * @param email 검사할 이메일 주소
     * @throws BusinessException 이미 사용 중인 이메일일 경우 발생
     */
    private void validateEmail(String email) {
        if (memberRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.DUPLICATED_EMAIL);
        }
    }

    /**
     * 닉네임 중복 여부를 DB에서 조회하여 검증합니다.
     *
     * @param nickname 검사할 닉네임
     * @throws BusinessException 이미 사용 중인 닉네임일 경우 발생
     */
    private void validateNickname(String nickname) {
        if (memberRepository.existsByNickname(nickname)) {
            throw new BusinessException(ErrorCode.DUPLICATED_NICKNAME);
        }
    }

    /**
     * 외부에서 접근 가능한 이메일 중복 체크 메서드입니다.
     *
     * @param email 검사할 이메일
     */
    public void checkEmailDuplicate(String email) {
        validateEmail(email);
    }

    /**
     * 외부에서 접근 가능한 닉네임 중복 체크 메서드입니다.
     *
     * @param nickname 검사할 닉네임
     */
    public void checkNicknameDuplicate(String nickname) {
        validateNickname(nickname);
    }

    /**
     * 이메일 인증 코드를 DB에 저장된 내역과 대조하여 검증합니다.
     * <p>
     * 1. 해당 이메일로 가장 최근에 발송된 인증 요청을 DB에서 조회합니다.<br>
     * 2. 입력된 인증 코드가 일치하는지 확인합니다.<br>
     * 3. 인증 코드의 유효 기간(만료 여부)을 확인합니다.
     * </p>
     *
     * @param email 인증을 요청한 이메일
     * @param code 사용자가 입력한 인증 코드
     * @throws BusinessException 코드가 불일치하거나, 만료되었거나, 내역이 없는 경우 발생
     */
    public void verifyEmailCode(String email, String code) {
        EmailVerification verification = emailVerificationRepository.findFirstByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.EMAIL_VERIFICATION_NOT_FOUND));

        if (!verification.getCode().equals(code)) {
            throw new BusinessException(ErrorCode.INVALID_EMAIL_VERIFICATION_CODE);
        }

        if (verification.isExpired()) {
            throw new BusinessException(ErrorCode.EMAIL_VERIFICATION_EXPIRED);
        }
    }
}

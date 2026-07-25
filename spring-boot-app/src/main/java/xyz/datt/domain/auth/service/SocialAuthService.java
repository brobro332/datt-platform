package xyz.datt.domain.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.auth.client.KakaoClient;
import xyz.datt.domain.auth.client.NaverClient;
import xyz.datt.domain.auth.dto.SocialLoginResponse;
import xyz.datt.domain.auth.entity.RefreshToken;
import xyz.datt.domain.auth.repository.RefreshTokenRepository;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.repository.MemberRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;
import xyz.datt.global.security.JwtProvider;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * 카카오, 네이버 등 소셜 로그인 기반의 회원 인증 비즈니스 로직을 처리하는 서비스입니다.
 * <p>
 * 외부 OAuth2 제공자와 통신하여 액세스 토큰을 획득하고 유저 정보를 가져와서,
 * 우리 플랫폼의 Member 엔티티와 연동 및 자체 JWT 발급을 수행합니다.
 * </p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SocialAuthService {
    private final KakaoClient kakaoClient;
    private final NaverClient naverClient;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private static final SecureRandom secureRandom = new SecureRandom();

    /**
     * 카카오 소셜 로그인을 처리합니다.
     * <p>
     * 1. 클라이언트가 전달한 인가 코드(code)를 이용해 카카오 서버로부터 액세스 토큰을 받아옵니다.<br>
     * 2. 획득한 액세스 토큰으로 카카오 사용자 정보를 조회합니다.<br>
     * 3. 사용자 정보에서 이메일과 닉네임을 추출합니다. 이메일이 없는 경우 임의의 이메일을 생성합니다.<br>
     * 4. 기존 회원 여부를 확인하고, 없으면 신규 소셜 회원으로 가입 처리합니다.<br>
     * 5. 자체 JWT(Access/Refresh Token)를 발급하여 반환합니다.
     * </p>
     *
     * @param code 카카오 인가 코드
     * @return 발급된 JWT 토큰 및 회원 정보가 포함된 소셜 로그인 응답 DTO
     */
    @Transactional
    public SocialLoginResponse loginKakao(String code) {
        String accessToken = kakaoClient.getAccessToken(code);
        if (accessToken == null) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, "카카오 로그인 액세스 토큰 획득에 실패했습니다.");
        }

        Map<String, Object> userInfo = kakaoClient.getUserInfo(accessToken);
        if (userInfo == null) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, "카카오 유저 정보 조회에 실패했습니다.");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> kakaoAccount = (Map<String, Object>) userInfo.get("kakao_account");
        String email = null;
        String nickname = "KakaoUser";

        // 1. properties 에서 닉네임 가져오기 시도
        @SuppressWarnings("unchecked")
        Map<String, Object> properties = (Map<String, Object>) userInfo.get("properties");
        if (properties != null && properties.get("nickname") != null) {
            nickname = (String) properties.get("nickname");
        }

        // 2. kakao_account.profile 에서 닉네임 가져오기 시도
        if (kakaoAccount != null) {
            email = (String) kakaoAccount.get("email");
            @SuppressWarnings("unchecked")
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
            if (profile != null && profile.get("nickname") != null) {
                nickname = (String) profile.get("nickname");
            }
        }

        if (email == null && userInfo.get("id") != null) {
            email = userInfo.get("id").toString() + "@kakao.user";
        }

        if (email == null) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, "이메일 정보를 불러올 수 없습니다.");
        }

        boolean isNewMember = !memberRepository.existsByEmail(email);
        Member member = getOrCreateSocialMember(email, nickname);
        return generateSocialTokens(member, isNewMember);
    }

    /**
     * 네이버 소셜 로그인을 처리합니다.
     * <p>
     * 1. 클라이언트가 전달한 인가 코드(code)를 이용해 네이버 서버로부터 액세스 토큰을 받아옵니다.<br>
     * 2. 획득한 액세스 토큰으로 네이버 사용자 정보를 조회합니다.<br>
     * 3. 응답 객체(response)에서 이메일과 닉네임을 추출합니다. 이메일 부재 시 임시 이메일을 생성합니다.<br>
     * 4. 기존 회원인지 확인 후, 비회원이면 새로운 소셜 계정을 자동 생성합니다.<br>
     * 5. 애플리케이션 자체 규격의 JWT 토큰을 발급하여 응답합니다.
     * </p>
     *
     * @param code 네이버 인가 코드
     * @return 자체 발급 JWT 토큰과 유저 식별 정보를 포함한 DTO
     */
    @Transactional
    public SocialLoginResponse loginNaver(String code) {
        String accessToken = naverClient.getAccessToken(code);
        if (accessToken == null) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, "네이버 로그인 액세스 토큰 획득에 실패했습니다.");
        }

        Map<String, Object> userInfo = naverClient.getUserInfo(accessToken);
        if (userInfo == null) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, "네이버 유저 정보 조회에 실패했습니다.");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> responseMap = (Map<String, Object>) userInfo.get("response");
        if (responseMap == null) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, "네이버 유저 응답 바디가 비어있습니다.");
        }

        String email = (String) responseMap.get("email");
        String nickname = (String) responseMap.get("nickname");

        if (email == null && responseMap.get("id") != null) {
            email = responseMap.get("id").toString() + "@naver.user";
        }

        if (email == null) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, "이메일 정보를 불러올 수 없습니다.");
        }

        if (nickname == null) {
            nickname = "NaverUser";
        }

        boolean isNewMember = !memberRepository.existsByEmail(email);
        Member member = getOrCreateSocialMember(email, nickname);
        return generateSocialTokens(member, isNewMember);
    }

    /**
     * 소셜 로그인 사용자의 이메일을 기반으로 기존 회원을 조회하거나, 
     * 새로운 회원을 자동 가입(DB 저장) 처리합니다.
     * <p>
     * 닉네임 중복 시 난수와 해시값을 이용해 유일한 닉네임으로 자동 조정하며,
     * 비밀번호는 시스템에서 생성한 임의의 UUID를 암호화하여 저장합니다.
     * </p>
     *
     * @param email 소셜에서 제공받은(또는 생성된) 사용자 이메일
     * @param nickname 소셜 프로필 기반 닉네임
     * @return 조회 또는 신규 생성된 Member 엔티티
     */
    private Member getOrCreateSocialMember(String email, String nickname) {
        return memberRepository.findByEmail(email)
                .orElseGet(() -> {
                    // 중복 닉네임 방지 처리
                    String uniqueNickname = nickname;
                    int suffix = 1;
                    while (memberRepository.existsByNickname(uniqueNickname)) {
                        uniqueNickname = nickname + "_" + (secureRandom.nextInt(9000) + 1000);
                        if (suffix++ > 10) {
                            uniqueNickname = nickname + "_" + (System.currentTimeMillis() % 10000);
                            break;
                        }
                    }

                    // 임시 난수 패스워드로 계정 생성
                    String randomPassword = UUID.randomUUID().toString();
                    String encodedPassword = passwordEncoder.encode(randomPassword);

                    Member newMember = Member.createUser(email, encodedPassword, uniqueNickname);
                    return memberRepository.save(newMember);
                });
    }

    /**
     * 회원 엔티티를 바탕으로 Access Token 및 Refresh Token을 생성하고 반환합니다.
     * 
     * @param member 인증이 완료된 사용자 엔티티
     * @param isNewMember 신규 가입 여부 플래그
     * @return 소셜 로그인 결과 응답 DTO
     */
    private SocialLoginResponse generateSocialTokens(Member member, boolean isNewMember) {
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

        return new SocialLoginResponse(
                accessToken,
                refreshToken,
                member.getId(),
                member.getNickname(),
                isNewMember,
                member.getRole().name()
        );
    }

    /**
     * 발급된 Refresh Token을 DB에 저장하거나 이미 존재하는 경우 갱신합니다.
     *
     * @param memberId 회원 ID
     * @param token 리프레시 토큰 값
     * @param expiredAt 토큰 만료 시간
     */
    private void saveOrUpdateRefreshToken(Long memberId, String token, LocalDateTime expiredAt) {
        refreshTokenRepository.findByMemberId(memberId)
                .ifPresentOrElse(
                        refreshToken -> refreshToken.updateToken(token, expiredAt),
                        () -> refreshTokenRepository.save(
                                RefreshToken.create(memberId, token, expiredAt)
                        )
                );
    }
}

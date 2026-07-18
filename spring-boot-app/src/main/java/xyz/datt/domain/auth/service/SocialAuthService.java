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

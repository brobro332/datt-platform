package xyz.datt.domain.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.auth.dto.LoginRequest;
import xyz.datt.domain.auth.dto.LoginResponse;
import xyz.datt.domain.auth.dto.SignupRequest;
import xyz.datt.domain.auth.dto.SignupResponse;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.repository.MemberRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;
import xyz.datt.global.security.JwtProvider;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        validateEmail(request.email());
        validateNickname(request.nickname());

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

    @Transactional(readOnly = true)
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

        return new LoginResponse(
            accessToken,
            member.getId(),
            member.getNickname()
        );
    }

    private void validateEmail(String email) {
        if (memberRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.DUPLICATED_EMAIL);
        }
    }

    private void validateNickname(String nickname) {
        if (memberRepository.existsByNickname(nickname)) {
            throw new BusinessException(ErrorCode.DUPLICATED_NICKNAME);
        }
    }
}

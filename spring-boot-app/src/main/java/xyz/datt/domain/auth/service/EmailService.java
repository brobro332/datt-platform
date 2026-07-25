package xyz.datt.domain.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.auth.entity.EmailVerification;
import xyz.datt.domain.auth.repository.EmailVerificationRepository;

import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * 이메일 인증 코드 발송 및 발송 내역 관리를 담당하는 서비스입니다.
 * <p>
 * 난수를 생성하여 사용자에게 SMTP 서버를 통해 이메일을 전송하며,
 * 전송된 인증 코드와 만료 시간을 DB에 기록하여 추후 검증 시 사용되도록 합니다.
 * </p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final EmailVerificationRepository emailVerificationRepository;
    private static final SecureRandom secureRandom = new SecureRandom();

    /**
     * 주어진 이메일 주소로 인증 코드를 생성하여 발송합니다.
     * <p>
     * 1. 6자리 난수로 구성된 인증 코드를 생성합니다.<br>
     * 2. 현재 시간 기준 3분 뒤를 만료 시간으로 설정합니다.<br>
     * 3. JavaMailSender를 통해 이메일을 발송합니다.<br>
     * 4. 발송 실패 시 (예: SMTP 서버 미설정) 에러를 로깅하고 콘솔에 인증 코드를 출력하는 Fallback 로직을 수행합니다.<br>
     * 5. 최종적으로 생성된 인증 코드와 만료 정보를 DB에 저장합니다.
     * </p>
     *
     * @param email 인증 코드를 받을 사용자의 이메일 주소
     */
    @Transactional
    public void sendVerificationCode(String email) {
        String code = generateVerificationCode();
        LocalDateTime expiredAt = LocalDateTime.now().plusMinutes(3); // 3분간 유효

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("[DATT] 회원가입 이메일 인증코드입니다.");
            message.setText("안녕하세요 DATT 입니다.\n\n회원가입을 위한 인증코드는 [" + code + "] 입니다.\n3분 이내에 가입 화면에 입력해 주세요.");
            mailSender.send(message);
            log.info("인증 메일 전송 성공: {}", email);
        } catch (Exception e) {
            log.error("메일 발송 실패: SMTP 설정 확인 필요. 이메일={}. 에러={}", email, e.getMessage());
            log.info("★[FALLBACK LOG] 메일 서버 미설정으로 콘솔 로그에 인증 코드를 출력합니다. ★");
            log.info("★[EMAIL VERIFICATION CODE] email: {}, code: {} ★", email, code);
        }

        // 인증코드와 만료 정보를 DB에 기록
        EmailVerification verification = new EmailVerification(email, code, expiredAt);
        emailVerificationRepository.save(verification);
    }

    /**
     * 6자리의 숫자 인증 코드를 안전하게(SecureRandom) 생성합니다.
     *
     * @return 100000 ~ 999999 범위의 무작위 숫자 문자열
     */
    private String generateVerificationCode() {
        int codeValue = secureRandom.nextInt(900000) + 100000; // 100000 ~ 999999
        return String.valueOf(codeValue);
    }
}

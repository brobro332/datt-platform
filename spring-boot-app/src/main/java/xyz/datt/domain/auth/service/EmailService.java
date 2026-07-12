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

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final EmailVerificationRepository emailVerificationRepository;
    private static final SecureRandom secureRandom = new SecureRandom();

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

    private String generateVerificationCode() {
        int codeValue = secureRandom.nextInt(900000) + 100000; // 100000 ~ 999999
        return String.valueOf(codeValue);
    }
}

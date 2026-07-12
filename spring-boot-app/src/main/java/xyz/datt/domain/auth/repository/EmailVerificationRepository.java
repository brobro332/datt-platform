package xyz.datt.domain.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.datt.domain.auth.entity.EmailVerification;

import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findFirstByEmailOrderByCreatedAtDesc(String email);
}

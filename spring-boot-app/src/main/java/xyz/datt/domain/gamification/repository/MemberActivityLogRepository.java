package xyz.datt.domain.gamification.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import xyz.datt.domain.gamification.entity.MemberActivityLog;

public interface MemberActivityLogRepository extends JpaRepository<MemberActivityLog, Long> {
    Page<MemberActivityLog> findByMemberIdOrderByCreatedAtDesc(Long memberId, Pageable pageable);
}
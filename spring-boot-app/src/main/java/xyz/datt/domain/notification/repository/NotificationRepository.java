package xyz.datt.domain.notification.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import xyz.datt.domain.notification.entity.Notification;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findAllByMemberIdOrderByCreatedAtDesc(Long memberId, Pageable pageable);
    
    long countByMemberIdAndIsReadFalse(Long memberId);
    
    List<Notification> findAllByMemberIdAndIsReadFalse(Long memberId);
}

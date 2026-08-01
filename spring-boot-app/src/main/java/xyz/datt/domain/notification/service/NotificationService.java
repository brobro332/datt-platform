package xyz.datt.domain.notification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.notification.entity.Notification;
import xyz.datt.domain.notification.repository.NotificationRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final WebPushService webPushService;

    @Transactional
    public void createNotification(Long memberId, String type, String title, String content) {
        Notification notification = Notification.builder()
                .memberId(memberId)
                .type(type)
                .title(title)
                .content(content)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
        
        // 브라우저 푸시 알림 비동기 전송 (여기서는 동기로 실행해도 내부가 빠르지만 가급적 비동기 처리가 좋음)
        // 편의상 바로 호출
        try {
            webPushService.sendPushNotificationToMember(memberId, title, content, null);
        } catch (Exception e) {
            // Push failure shouldn't rollback notification creation
        }
    }

    public Page<Notification> getMyNotifications(Long memberId, Pageable pageable) {
        return notificationRepository.findAllByMemberIdOrderByCreatedAtDesc(memberId, pageable);
    }

    public long getUnreadCount(Long memberId) {
        return notificationRepository.countByMemberIdAndIsReadFalse(memberId);
    }

    @Transactional
    public void readNotification(Long memberId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        
        if (!notification.getMemberId().equals(memberId)) {
            throw new IllegalArgumentException("No permission to read this notification");
        }
        
        notification.markAsRead();
    }

    @Transactional
    public void readAllNotifications(Long memberId) {
        List<Notification> unreadList = notificationRepository.findAllByMemberIdAndIsReadFalse(memberId);
        unreadList.forEach(Notification::markAsRead);
    }
}

package xyz.datt.domain.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.datt.domain.notification.entity.PushSubscription;

import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findAllByMemberId(Long memberId);
    Optional<PushSubscription> findByEndpoint(String endpoint);
    void deleteByEndpoint(String endpoint);
}

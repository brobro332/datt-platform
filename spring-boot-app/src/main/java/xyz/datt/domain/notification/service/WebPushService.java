package xyz.datt.domain.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.LoggerFactory;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.notification.dto.PushSubscriptionRequest;
import xyz.datt.domain.notification.entity.PushSubscription;
import xyz.datt.domain.notification.repository.PushSubscriptionRepository;

import jakarta.annotation.PostConstruct;
import java.security.Security;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WebPushService {

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private PushService pushService;

    @Value("${VAPID_PUBLIC_KEY}")
    private String publicKey;

    @Value("${VAPID_PRIVATE_KEY}")
    private String privateKey;

    @PostConstruct
    public void init() {
        try {
            if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
                Security.addProvider(new BouncyCastleProvider());
            }
            pushService = new PushService();
            pushService.setPublicKey(publicKey);
            pushService.setPrivateKey(privateKey);
            // Default subject, usually a mailto: or url
            pushService.setSubject("mailto:support@datt.xyz");
        } catch (Exception e) {
            LoggerFactory.getLogger(WebPushService.class).error("Error initializing PushService", e);
        }
    }

    @Transactional
    public void subscribe(Long memberId, PushSubscriptionRequest request) {
        // Delete existing if any (to avoid duplicates)
        pushSubscriptionRepository.findByEndpoint(request.getEndpoint())
                .ifPresent(sub -> pushSubscriptionRepository.delete(sub));

        PushSubscription subscription = PushSubscription.builder()
                .memberId(memberId)
                .endpoint(request.getEndpoint())
                .p256dh(request.getKeys().getP256dh())
                .auth(request.getKeys().getAuth())
                .build();
        pushSubscriptionRepository.save(subscription);
    }

    @Transactional
    public void unsubscribe(String endpoint) {
        pushSubscriptionRepository.deleteByEndpoint(endpoint);
    }

    @Transactional(readOnly = true)
    public void sendPushNotificationToMember(Long memberId, String title, String body, String url) {
        List<PushSubscription> subscriptions = pushSubscriptionRepository.findAllByMemberId(memberId);
        if (subscriptions.isEmpty()) {
            return;
        }

        try {
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("title", title);
            payloadMap.put("body", body);
            if (url != null) payloadMap.put("url", url);
            
            String payload = objectMapper.writeValueAsString(payloadMap);

            for (PushSubscription sub : subscriptions) {
                try {
                    Subscription.Keys keys = new Subscription.Keys(sub.getP256dh(), sub.getAuth());
                    Subscription pushSub = new Subscription(sub.getEndpoint(), keys);
                    
                    Notification notification = new Notification(pushSub, payload);
                    pushService.send(notification);
                } catch (Exception e) {
                    LoggerFactory.getLogger(WebPushService.class).warn("Failed to send push to endpoint {}: {}", sub.getEndpoint(), e.getMessage());
                    // Alternatively, we could delete expired subscriptions (e.g. 404 or 410 response)
                }
            }
        } catch (Exception e) {
            LoggerFactory.getLogger(WebPushService.class).error("Error processing payload", e);
        }
    }
}

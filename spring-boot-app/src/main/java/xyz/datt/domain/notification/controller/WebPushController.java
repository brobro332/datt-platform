package xyz.datt.domain.notification.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import xyz.datt.domain.notification.dto.PushSubscriptionRequest;
import xyz.datt.domain.notification.service.WebPushService;
import xyz.datt.global.security.CustomUserDetails;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class WebPushController {

    private final WebPushService webPushService;

    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribe(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody PushSubscriptionRequest request) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        webPushService.subscribe(userDetails.getMemberId(), request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/unsubscribe")
    public ResponseEntity<Void> unsubscribe(
            @RequestParam String endpoint) {
        webPushService.unsubscribe(endpoint);
        return ResponseEntity.ok().build();
    }
}

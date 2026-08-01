package xyz.datt.domain.support.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.support.dto.InquiryCreateRequest;
import xyz.datt.domain.support.dto.ReportCreateRequest;
import xyz.datt.domain.support.service.SupportService;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    @PostMapping("/inquiries")
    public ResponseEntity<Void> createInquiry(
            @RequestBody InquiryCreateRequest request,
            @AuthenticationPrincipal String userId) {
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        supportService.createInquiry(request, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reports")
    public ResponseEntity<Void> createReport(
            @RequestBody ReportCreateRequest request,
            @AuthenticationPrincipal String userId) {
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        supportService.createReport(request, userId);
        return ResponseEntity.ok().build();
    }
}

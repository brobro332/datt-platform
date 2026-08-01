package xyz.datt.domain.support.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import xyz.datt.domain.support.entity.ServiceInquiry;
import xyz.datt.domain.support.dto.InquiryCreateRequest;
import xyz.datt.domain.support.dto.ReportCreateRequest;
import xyz.datt.domain.support.service.SupportService;
import xyz.datt.global.security.CustomUserDetails;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    @PostMapping("/inquiries")
    public ResponseEntity<Void> createInquiry(
            @RequestBody InquiryCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        String userId = String.valueOf(userDetails.getMemberId());
        supportService.createInquiry(request, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reports")
    public ResponseEntity<Void> createReport(
            @RequestBody ReportCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        String userId = String.valueOf(userDetails.getMemberId());
        supportService.createReport(request, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/inquiries/me")
    public ResponseEntity<Page<ServiceInquiry>> getMyInquiries(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        String userId = String.valueOf(userDetails.getMemberId());
        Page<ServiceInquiry> result = supportService.getMyInquiries(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(result);
    }
}

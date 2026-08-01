package xyz.datt.domain.support.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.datt.domain.support.entity.Report;
import xyz.datt.domain.support.entity.ServiceInquiry;
import xyz.datt.domain.support.service.SupportService;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/support")
@RequiredArgsConstructor
public class AdminSupportController {

    private final SupportService supportService;

    @GetMapping("/inquiries")
    public ResponseEntity<Page<ServiceInquiry>> getInquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(supportService.getInquiries(PageRequest.of(page, size)));
    }

    @GetMapping("/reports")
    public ResponseEntity<Page<Report>> getReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(supportService.getReports(PageRequest.of(page, size)));
    }

    @PatchMapping("/inquiries/{id}/resolve")
    public ResponseEntity<Void> resolveInquiry(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String answer = body.get("answer");
        supportService.resolveInquiry(id, answer);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/reports/{id}/resolve")
    public ResponseEntity<Void> resolveReport(@PathVariable Long id) {
        supportService.resolveReport(id);
        return ResponseEntity.ok().build();
    }
}

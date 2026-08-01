package xyz.datt.domain.support.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.support.dto.InquiryCreateRequest;
import xyz.datt.domain.support.dto.ReportCreateRequest;
import xyz.datt.domain.support.entity.Report;
import xyz.datt.domain.support.entity.ServiceInquiry;
import xyz.datt.domain.support.repository.ReportRepository;
import xyz.datt.domain.support.repository.ServiceInquiryRepository;
import xyz.datt.domain.notification.service.NotificationService;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupportService {

    private final ServiceInquiryRepository inquiryRepository;
    private final ReportRepository reportRepository;
    private final NotificationService notificationService;

    @Transactional
    public ServiceInquiry createInquiry(InquiryCreateRequest request, String authorId) {
        ServiceInquiry inquiry = ServiceInquiry.builder()
                .category(request.getCategory())
                .content(request.getContent())
                .status("PENDING")
                .authorId(authorId)
                .build();
        return inquiryRepository.save(inquiry);
    }

    @Transactional
    public Report createReport(ReportCreateRequest request, String reporterId) {
        Report report = Report.builder()
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .reason(request.getReason())
                .status("PENDING")
                .reporterId(reporterId)
                .build();
        return reportRepository.save(report);
    }

    public Page<ServiceInquiry> getInquiries(Pageable pageable) {
        return inquiryRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<ServiceInquiry> getMyInquiries(String authorId, Pageable pageable) {
        return inquiryRepository.findAllByAuthorIdOrderByCreatedAtDesc(authorId, pageable);
    }

    public Page<Report> getReports(Pageable pageable) {
        return reportRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional
    public void resolveInquiry(Long id, String answer) {
        ServiceInquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inquiry not found"));
        inquiry.resolve(answer);

        try {
            Long memberId = Long.parseLong(inquiry.getAuthorId());
            notificationService.createNotification(
                    memberId,
                    "SUPPORT_REPLY",
                    "서비스 문의에 대한 답변이 등록되었습니다.",
                    "고객님의 문의에 관리자가 답변을 남겼습니다."
            );
        } catch (NumberFormatException e) {
            // ignore
        }
    }

    @Transactional
    public void resolveReport(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        report.resolve();
    }
}

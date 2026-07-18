package xyz.datt.domain.admin.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.admin.entity.AdminActivityLog;
import xyz.datt.domain.admin.repository.AdminActivityLogRepository;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.repository.MemberRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminActivityLogService {
    private final AdminActivityLogRepository adminActivityLogRepository;
    private final MemberRepository memberRepository;

    public void logActivity(Long memberId, String actionType, String description, HttpServletRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        String ipAddress = getClientIp(request);

        AdminActivityLog log = AdminActivityLog.builder()
                .adminEmail(member.getEmail())
                .adminNickname(member.getNickname())
                .actionType(actionType)
                .description(description)
                .ipAddress(ipAddress)
                .build();

        adminActivityLogRepository.save(log);
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return "0.0.0.0";
        }
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}

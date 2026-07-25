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

/**
 * 관리자 활동 로그 처리를 담당하는 서비스 클래스입니다.
 * 관리자의 행동(예: 삭제, 수정 등)을 추적하고 IP 정보를 함께 저장하여 보안 및 감사 목적으로 사용됩니다.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AdminActivityLogService {
    private final AdminActivityLogRepository adminActivityLogRepository;
    private final MemberRepository memberRepository;

    /**
     * 관리자의 특정 활동을 로그로 기록합니다.
     * <p>
     * 전달받은 멤버 ID로 회원을 조회한 후, 요청 정보를 통해 클라이언트의 IP 주소를 추출하여
     * 활동 유형 및 설명과 함께 데이터베이스에 저장합니다.
     * </p>
     *
     * @param memberId 활동을 수행한 관리자(회원)의 ID
     * @param actionType 수행한 활동의 유형 (예: "DELETE_AD")
     * @param description 수행한 활동에 대한 상세 설명
     * @param request HTTP 요청 객체 (클라이언트 IP 추출을 위해 사용)
     * @throws BusinessException 대상 회원을 찾을 수 없는 경우 발생 (MEMBER_NOT_FOUND)
     */
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

    /**
     * HTTP 요청 객체에서 클라이언트의 실제 IP 주소를 추출합니다.
     * 프록시 서버나 로드 밸런서를 거쳐 들어온 요청의 경우를 대비해 다양한 헤더를 검사합니다.
     *
     * @param request HTTP 요청 객체
     * @return 클라이언트의 IP 주소 문자열
     */
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

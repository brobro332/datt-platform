package xyz.datt.global.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.global.response.ApiResponse;

import java.util.Map;

/**
 * 애플리케이션의 헬스체크(Health Check) 상태를 확인하기 위한 컨트롤러입니다.
 * <p>
 * 비즈니스 로직 흐름(Call Graph):
 * 1. 로드 밸런서(AWS ALB 등), 쿠버네티스(Liveness/Readiness Probe) 또는 모니터링 도구가 해당 엔드포인트를 호출합니다.
 * 2. HealthController가 요청을 수신합니다.
 * 3. 서비스나 DB 연결 여부를 복잡하게 거치지 않고, 웹 애플리케이션이 구동되어 요청을 처리할 수 있는 상태임을 단순히 확인하여 반환합니다.
 * 4. status: "UP" 값을 가지는 Map을 반환하여 인프라에 정상 구동 중임을 알립니다.
 * </p>
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    /**
     * 서버 애플리케이션의 상태가 정상(UP)인지 확인합니다.
     * 모니터링 시스템이나 클라우드 인프라의 상태 점검 시 주로 호출됩니다.
     *
     * @return 상태가 정상임을 나타내는 맵 (키: status, 값: UP)
     */
    @GetMapping
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.success(
            Map.of("status", "UP")
        );
    }
}
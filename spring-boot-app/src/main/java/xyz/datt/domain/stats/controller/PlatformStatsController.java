package xyz.datt.domain.stats.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.stats.dto.PlatformStatsResponse;
import xyz.datt.domain.stats.service.PlatformStatsService;
import xyz.datt.global.response.ApiResponse;

/**
 * 플랫폼 전체의 운영 통계 정보를 제공하는 API 컨트롤러입니다.
 * <p>
 * 비즈니스 로직 흐름(Call Graph):
 * 1. 클라이언트가 플랫폼 대시보드 등의 화면을 위해 통계 API를 요청합니다.
 * 2. PlatformStatsController가 요청을 받아 {@link PlatformStatsService#getPlatformStats}를 호출합니다.
 * 3. 서비스 계층에서는 회원 수, 총 장소 수, 리뷰 수, 일일 활성 사용자(DAU) 등의 주요 통계 지표를 DB나 캐시에서 취합합니다.
 * 4. 취합된 결과를 PlatformStatsResponse 객체로 생성하여 컨트롤러에 반환합니다.
 * 5. 컨트롤러는 최종 결과를 {@link ApiResponse}로 래핑하여 응답합니다.
 * </p>
 */
@RestController
@RequiredArgsConstructor
public class PlatformStatsController {

    private final PlatformStatsService platformStatsService;

    /**
     * 플랫폼의 전반적인 통계 수치(예: 총 가입자 수, 장소 데이터 수, 누적 리뷰 수 등)를 조회합니다.
     *
     * @return 플랫폼 전체 통계 지표를 담은 응답 객체
     */
    @GetMapping("/api/stats")
    public ApiResponse<PlatformStatsResponse> getPlatformStats() {
        return ApiResponse.success(platformStatsService.getPlatformStats());
    }
}

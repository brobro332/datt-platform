package xyz.datt.domain.stats.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.stats.dto.PlatformStatsResponse;
import xyz.datt.domain.stats.service.PlatformStatsService;
import xyz.datt.global.response.ApiResponse;

@RestController
@RequiredArgsConstructor
public class PlatformStatsController {

    private final PlatformStatsService platformStatsService;

    @GetMapping("/api/stats")
    public ApiResponse<PlatformStatsResponse> getPlatformStats() {
        return ApiResponse.success(platformStatsService.getPlatformStats());
    }
}

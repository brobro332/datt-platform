package xyz.datt.domain.advertisement.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import xyz.datt.domain.advertisement.dto.AdvertisementDto.AdCreateRequest;
import xyz.datt.domain.advertisement.dto.AdvertisementDto.AdResponse;
import xyz.datt.domain.advertisement.service.AdvertisementService;
import xyz.datt.domain.admin.service.AdminActivityLogService;
import xyz.datt.global.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import xyz.datt.global.response.ApiResponse;

import java.util.List;

/**
 * 관리자 및 일반 사용자용 광고 배너 도메인의 API 요청을 처리하는 컨트롤러입니다.
 * 광고 배너의 생성, 삭제, 조회 기능을 제공하며, 관리자의 생성 및 삭제 작업은 활동 로그로 기록됩니다.
 */
@RestController
@RequiredArgsConstructor
public class AdvertisementAdminController {
    private final AdvertisementService advertisementService;
    private final AdminActivityLogService adminActivityLogService;

    /**
     * 관리자용으로 전체 광고 배너 목록을 조회합니다.
     * 활성화 여부와 관계없이 모든 광고 배너를 반환합니다.
     *
     * @return 전체 광고 배너 목록
     */
    @GetMapping("/api/admin/ads")
    public ApiResponse<List<AdResponse>> getAllAdsForAdmin() {
        List<AdResponse> ads = advertisementService.getAllAdsForAdmin();
        return ApiResponse.success(ads);
    }

    /**
     * 신규 광고 배너를 생성하고 등록합니다.
     * 배너 등록 성공 시, 관리자의 활동 로그(CREATE_AD)를 저장합니다.
     *
     * @param request 생성할 광고 배너 정보 (제목, 링크 등)
     * @param userDetails 현재 인증된 사용자(관리자) 정보
     * @param httpRequest 현재 HTTP 요청 객체
     * @return 생성된 광고 배너 정보
     */
    @PostMapping("/api/admin/ads")
    public ApiResponse<AdResponse> createAd(
            @Valid @RequestBody AdCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest httpRequest
    ) {
        AdResponse response = advertisementService.createAd(request);

        if (userDetails != null) {
            adminActivityLogService.logActivity(
                    userDetails.getMemberId(),
                    "CREATE_AD",
                    String.format("신규 광고 배너 등록 - 제목: %s, 연결 링크: %s", request.title(), request.linkUrl()),
                    httpRequest
            );
        }

        return ApiResponse.success(response);
    }

    /**
     * 특정 광고 배너를 삭제합니다.
     * 배너 삭제 성공 시, 관리자의 활동 로그(DELETE_AD)를 저장합니다.
     *
     * @param adId 삭제할 광고 배너의 식별자
     * @param userDetails 현재 인증된 사용자(관리자) 정보
     * @param httpRequest 현재 HTTP 요청 객체
     * @return 빈 성공 응답
     */
    @DeleteMapping("/api/admin/ads/{adId}")
    public ApiResponse<Void> deleteAd(
            @PathVariable Long adId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest httpRequest
    ) {
        advertisementService.deleteAd(adId);

        if (userDetails != null) {
            adminActivityLogService.logActivity(
                    userDetails.getMemberId(),
                    "DELETE_AD",
                    String.format("광고 배너 삭제 - 광고 ID: %d", adId),
                    httpRequest
            );
        }

        return ApiResponse.success(null);
    }

    /**
     * 일반 사용자용으로 현재 활성화된 광고 배너 목록을 조회합니다.
     * 프론트엔드에서 노출할 목적으로 사용됩니다.
     *
     * @return 활성화된 광고 배너 목록
     */
    @GetMapping("/api/ads")
    public ApiResponse<List<AdResponse>> getActiveAds() {
        List<AdResponse> ads = advertisementService.getActiveAds();
        return ApiResponse.success(ads);
    }
}

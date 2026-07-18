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

@RestController
@RequiredArgsConstructor
public class AdvertisementAdminController {
    private final AdvertisementService advertisementService;
    private final AdminActivityLogService adminActivityLogService;

    @GetMapping("/api/admin/ads")
    public ApiResponse<List<AdResponse>> getAllAdsForAdmin() {
        List<AdResponse> ads = advertisementService.getAllAdsForAdmin();
        return ApiResponse.success(ads);
    }

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

    @GetMapping("/api/ads")
    public ApiResponse<List<AdResponse>> getActiveAds() {
        List<AdResponse> ads = advertisementService.getActiveAds();
        return ApiResponse.success(ads);
    }
}

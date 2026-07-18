package xyz.datt.domain.advertisement.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import xyz.datt.domain.advertisement.dto.AdvertisementDto.AdCreateRequest;
import xyz.datt.domain.advertisement.dto.AdvertisementDto.AdResponse;
import xyz.datt.domain.advertisement.service.AdvertisementService;
import xyz.datt.global.response.ApiResponse;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AdvertisementAdminController {
    private final AdvertisementService advertisementService;

    @GetMapping("/api/admin/ads")
    public ApiResponse<List<AdResponse>> getAllAdsForAdmin() {
        List<AdResponse> ads = advertisementService.getAllAdsForAdmin();
        return ApiResponse.success(ads);
    }

    @PostMapping("/api/admin/ads")
    public ApiResponse<AdResponse> createAd(@Valid @RequestBody AdCreateRequest request) {
        AdResponse response = advertisementService.createAd(request);
        return ApiResponse.success(response);
    }

    @DeleteMapping("/api/admin/ads/{adId}")
    public ApiResponse<Void> deleteAd(@PathVariable Long adId) {
        advertisementService.deleteAd(adId);
        return ApiResponse.success(null);
    }

    @GetMapping("/api/ads")
    public ApiResponse<List<AdResponse>> getActiveAds() {
        List<AdResponse> ads = advertisementService.getActiveAds();
        return ApiResponse.success(ads);
    }
}

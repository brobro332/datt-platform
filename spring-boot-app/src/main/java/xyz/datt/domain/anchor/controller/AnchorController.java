package xyz.datt.domain.anchor.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import xyz.datt.domain.anchor.dto.AnchorCreateRequest;
import xyz.datt.domain.anchor.dto.AnchorDetailResponse;
import xyz.datt.domain.anchor.dto.AnchorSummaryResponse;
import xyz.datt.domain.anchor.entity.AnchorPlaceCategory;
import xyz.datt.domain.anchor.entity.AnchorSortType;
import xyz.datt.domain.anchor.service.AnchorCreateService;
import xyz.datt.domain.anchor.service.AnchorDetailService;
import xyz.datt.domain.anchor.service.AnchorListService;
import xyz.datt.domain.anchor.service.AnchorRecommendationService;
import xyz.datt.domain.place.dto.PlaceNearbyResponse;
import xyz.datt.global.response.ApiResponse;
import xyz.datt.global.security.CustomUserDetails;

import java.util.List;
import java.util.Map;


@RestController
@RequiredArgsConstructor
public class AnchorController {
    private final AnchorCreateService anchorCreateService;
    private final AnchorDetailService anchorDetailService;
    private final AnchorListService anchorListService;
    private final AnchorRecommendationService anchorRecommendationService;
    private final xyz.datt.domain.anchor.service.AnchorDeleteService anchorDeleteService;
    private final xyz.datt.domain.anchor.service.AnchorVisibilityService anchorVisibilityService;
    private final xyz.datt.domain.anchor.service.AnchorTitleService anchorTitleService;

    @PostMapping("/api/anchors")
    public ApiResponse<AnchorDetailResponse> createAnchor(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @Valid @RequestBody AnchorCreateRequest request
    ) {
        AnchorDetailResponse response = anchorCreateService.createAnchor(
            userDetails.getMemberId(),
            request
        );

        return ApiResponse.success(response);
    }

    @DeleteMapping("/api/anchors/{anchorId}")
    public ApiResponse<Void> deleteAnchor(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long anchorId
    ) {
        anchorDeleteService.deleteAnchor(userDetails.getMemberId(), anchorId);
        return ApiResponse.success(null);
    }

    @PatchMapping("/api/anchors/{anchorId}/visibility")
    public ApiResponse<Void> changeVisibility(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long anchorId,
        @RequestParam boolean isPublic
    ) {
        anchorVisibilityService.changeVisibility(userDetails.getMemberId(), anchorId, isPublic);
        return ApiResponse.success(null);
    }

    @PatchMapping("/api/anchors/{anchorId}/title")
    public ApiResponse<Void> changeTitle(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long anchorId,
        @RequestParam String title
    ) {
        anchorTitleService.changeTitle(userDetails.getMemberId(), anchorId, title);
        return ApiResponse.success(null);
    }

    @GetMapping("/api/anchors/recommendations")
    public ApiResponse<Map<AnchorPlaceCategory, List<PlaceNearbyResponse>>> getRecommendations(
        @RequestParam(required = false) Double lat,
        @RequestParam(required = false) Double lon,
        @RequestParam(defaultValue = "3.0") Double radiusKm,
        @RequestParam(required = false) String province,
        @RequestParam(required = false) String district
    ) {
        if (province != null && district != null) {
            return ApiResponse.success(anchorRecommendationService.recommendByRegion(province, district));
        }
        return ApiResponse.success(anchorRecommendationService.recommendByCategory(lat, lon, radiusKm));
    }

    @GetMapping("/api/anchors/{anchorId}")
    public ApiResponse<AnchorDetailResponse> getAnchorDetail(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long anchorId
    ) {
        Long memberId = userDetails == null
            ? null
            : userDetails.getMemberId();

        AnchorDetailResponse response = anchorDetailService.getAnchorDetail(
            memberId,
            anchorId
        );

        return ApiResponse.success(response);
    }

    @GetMapping("/api/anchors")
    public ApiResponse<Page<AnchorSummaryResponse>> getPublicAnchors(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @RequestParam(defaultValue = "LATEST") AnchorSortType sortType,
        Pageable pageable
    ) {
        Long memberId = userDetails == null
            ? null
            : userDetails.getMemberId();

        Page<AnchorSummaryResponse> response = anchorListService.getPublicAnchors(
            memberId,
            sortType,
            pageable
        );

        return ApiResponse.success(response);
    }

    @GetMapping("/api/my/anchors")
    public ApiResponse<Page<AnchorSummaryResponse>> getMyAnchors(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @RequestParam(defaultValue = "LATEST") AnchorSortType sortType,
        Pageable pageable
    ) {
        Page<AnchorSummaryResponse> response = anchorListService.getMyAnchors(
            userDetails.getMemberId(),
            sortType,
            pageable
        );

        return ApiResponse.success(response);
    }

    @GetMapping("/api/anchors/popular")
    public ApiResponse<Page<AnchorSummaryResponse>> getPopularAnchors(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        Pageable pageable
    ) {
        Long memberId = userDetails == null
            ? null
            : userDetails.getMemberId();

        Page<AnchorSummaryResponse> response = anchorListService.getPopularAnchors(
            memberId,
            pageable
        );

        return ApiResponse.success(response);
    }
}
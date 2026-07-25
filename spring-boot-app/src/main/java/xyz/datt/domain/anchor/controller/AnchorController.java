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


/**
 * 앵커(Anchor) 관련된 도메인의 API 요청을 처리하는 컨트롤러입니다.
 * 앵커의 생성, 수정, 삭제, 조회, 추천 등 전반적인 라이프사이클 및 기능을 관리합니다.
 */
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

    /**
     * 신규 앵커를 생성합니다.
     * 앵커 생성 서비스(AnchorCreateService)를 통해 데이터베이스에 앵커 정보를 저장합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param request 앵커 생성에 필요한 요청 데이터
     * @return 생성된 앵커 상세 정보
     */
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

    /**
     * 특정 앵커에 포함된 장소 목록을 수정합니다.
     * 기존에 등록된 장소 목록을 새로 전달받은 장소 ID 목록으로 교체합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param placeIds 교체할 새로운 장소 ID 목록
     * @param anchorId 대상 앵커 ID
     * @return 수정된 앵커의 상세 정보
     */
    @PutMapping("/api/anchors/{anchorId}/places")
    public ApiResponse<AnchorDetailResponse> updateAnchorPlaces(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @Valid @RequestBody List<Long> placeIds,
        @PathVariable Long anchorId
    ) {
        AnchorDetailResponse response = anchorCreateService.updateAnchor(
            userDetails.getMemberId(),
            anchorId,
            placeIds
        );
        return ApiResponse.success(response);
    }

    /**
     * 특정 앵커를 삭제합니다.
     * 본인이 생성한 앵커인지 확인한 후, 앵커 삭제 서비스(AnchorDeleteService)를 통해 처리합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param anchorId 삭제할 앵커 ID
     * @return 빈 성공 응답
     */
    @DeleteMapping("/api/anchors/{anchorId}")
    public ApiResponse<Void> deleteAnchor(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long anchorId
    ) {
        anchorDeleteService.deleteAnchor(userDetails.getMemberId(), anchorId);
        return ApiResponse.success(null);
    }

    /**
     * 앵커의 공개 여부(Visibility)를 변경합니다.
     * 다른 사용자가 조회할 수 있는지 여부를 전환합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param anchorId 상태를 변경할 앵커 ID
     * @param isPublic 공개 여부 (true: 공개, false: 비공개)
     * @return 빈 성공 응답
     */
    @PatchMapping("/api/anchors/{anchorId}/visibility")
    public ApiResponse<Void> changeVisibility(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long anchorId,
        @RequestParam boolean isPublic
    ) {
        anchorVisibilityService.changeVisibility(userDetails.getMemberId(), anchorId, isPublic);
        return ApiResponse.success(null);
    }

    /**
     * 앵커의 제목을 변경합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param anchorId 변경할 대상 앵커 ID
     * @param title 새롭게 설정할 제목
     * @return 빈 성공 응답
     */
    @PatchMapping("/api/anchors/{anchorId}/title")
    public ApiResponse<Void> changeTitle(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long anchorId,
        @RequestParam String title
    ) {
        anchorTitleService.changeTitle(userDetails.getMemberId(), anchorId, title);
        return ApiResponse.success(null);
    }

    /**
     * 지역 또는 위치 기반으로 추천 앵커 및 장소 정보를 조회합니다.
     * 지역명(시/도, 구/군)이 주어지면 지역 기반으로 추천하고, 그렇지 않으면 위/경도 기반 반경으로 카테고리별 추천을 수행합니다.
     *
     * @param lat 기준 위도 (선택)
     * @param lon 기준 경도 (선택)
     * @param radiusKm 검색 반경(km), 기본값 3.0 (선택)
     * @param province 시/도 정보 (선택)
     * @param district 구/군 정보 (선택)
     * @return 카테고리별로 그룹화된 주변 장소 및 앵커 추천 목록
     */
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

    /**
     * 특정 앵커의 상세 정보를 조회합니다.
     * 사용자가 로그인한 상태라면 좋아요 여부 등 개인화된 데이터가 포함되어 반환됩니다.
     *
     * @param userDetails 인증된 사용자 정보 (비로그인 시 null 가능)
     * @param anchorId 조회할 앵커 ID
     * @return 앵커 상세 정보 객체
     */
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

    /**
     * 전체 공개된 앵커 목록을 정렬 조건에 따라 페이징하여 조회합니다.
     *
     * @param userDetails 인증된 사용자 정보 (비로그인 시 null 가능)
     * @param sortType 앵커 정렬 방식 (예: 최신순 LATEST)
     * @param pageable 페이징 정보
     * @return 페이징된 앵커 요약 정보 목록
     */
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

    /**
     * 사용자가 직접 생성한 본인의 앵커 목록을 페이징하여 조회합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param sortType 앵커 정렬 방식
     * @param pageable 페이징 정보
     * @return 페이징된 본인 앵커 요약 정보 목록
     */
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

    /**
     * 인기 앵커 목록을 페이징하여 조회합니다.
     * 특정 기준(예: 좋아요 수, 조회수 등)에 따라 인기 있는 앵커들을 반환합니다.
     *
     * @param userDetails 인증된 사용자 정보 (비로그인 시 null 가능)
     * @param pageable 페이징 정보
     * @return 페이징된 인기 앵커 요약 정보 목록
     */
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
package xyz.datt.domain.place.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.place.dto.PlaceDetailResponse;
import xyz.datt.domain.place.service.PlaceDetailService;
import xyz.datt.global.response.ApiResponse;
import xyz.datt.global.security.CustomUserDetails;

/**
 * 개별 장소(Place)의 상세 정보를 제공하기 위한 컨트롤러입니다.
 * 사용자의 로그인 여부에 따라 개인화된 정보(예: 해당 장소 찜 여부 등)를 포함하여 상세 페이지용 데이터를 응답합니다.
 */
@RestController
@RequiredArgsConstructor
public class PlaceDetailController {
    private final PlaceDetailService placeDetailService;

    /**
     * 특정 장소의 상세 정보를 조회합니다.
     *
     * [Call Graph]
     * 1. GET 요청으로 전달받은 placeId를 파라미터로 추출.
     * 2. userDetails(현재 인증 정보)가 null인 경우:
     *    -> 비로그인 사용자로 간주하고 placeDetailService.getPlaceDetail(placeId)를 호출하여 기본 장소 정보 응답.
     * 3. userDetails가 존재하는 경우:
     *    -> 로그인 사용자로 간주하고 placeDetailService.getPlaceDetail(memberId, placeId)를 호출하여 
     *       회원 맞춤 정보(찜 상태 등)가 포함된 상세 장소 정보 응답.
     *
     * @param userDetails 현재 로그인한 사용자의 인증 정보 (비로그인 시 null)
     * @param placeId 상세 조회할 장소의 ID
     * @return 장소 상세 정보(PlaceDetailResponse)
     */
    @GetMapping("/api/places/{placeId}")
    public ApiResponse<PlaceDetailResponse> getPlaceDetail(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long placeId
    ) {
        if (userDetails == null) {
            return ApiResponse.success(placeDetailService.getPlaceDetail(placeId));
        }

        return ApiResponse.success(placeDetailService.getPlaceDetail(userDetails.getMemberId(), placeId));
    }
}
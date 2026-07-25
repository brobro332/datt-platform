package xyz.datt.domain.place.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.place.dto.PlaceNearbyCondition;
import xyz.datt.domain.place.dto.PlaceNearbyResponse;
import xyz.datt.domain.place.service.PlaceNearbyService;
import xyz.datt.global.response.ApiResponse;

/**
 * 내 주변(근처) 장소를 검색하는 API를 제공하는 컨트롤러입니다.
 * <p>
 * 비즈니스 로직 흐름(Call Graph):
 * 1. 클라이언트(주로 앱/웹 사용자)가 현재 위치 기반 장소 검색 요청을 보냅니다.
 * 2. PlaceNearbyController가 해당 요청을 수신합니다.
 * 3. {@link PlaceNearbyService#searchNearbyPlaces}를 호출합니다.
 *    - 전달된 위치 정보(위경도 등) 및 필터 조건을 기반으로 공간 쿼리를 수행합니다.
 *    - 데이터베이스 또는 검색 엔진에서 반경 내 가까운 장소 목록을 찾습니다.
 * 4. 조회된 근처 장소 데이터를 페이징(Page) 처리하여 반환받고, 이를 {@link ApiResponse}로 래핑하여 응답합니다.
 * </p>
 */
@RestController
@RequiredArgsConstructor
public class PlaceNearbyController {
    private final PlaceNearbyService placeNearbyService;

    /**
     * 지정된 위치 기준 반경 내 근처 장소들을 검색합니다.
     * 
     * @param condition 주변 장소 검색 조건 (위도, 경도, 반경 거리, 필터링 옵션 등 포함)
     * @param pageable  요청할 페이지 번호 및 페이지 크기(페이징 설정)
     * @return 검색된 근처 장소 정보 및 페이징 메타데이터를 포함한 응답 객체
     */
    @GetMapping("/api/places/nearby")
    public ApiResponse<Page<PlaceNearbyResponse>> searchNearbyPlaces(
        @ModelAttribute PlaceNearbyCondition condition,
        Pageable pageable
    ) {
        Page<PlaceNearbyResponse> response = placeNearbyService.searchNearbyPlaces(
            condition,
            pageable
        );

        return ApiResponse.success(response);
    }
}
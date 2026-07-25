package xyz.datt.domain.place.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.place.dto.SubwayStationResponse;
import xyz.datt.domain.place.service.SubwayStationService;
import xyz.datt.global.response.ApiResponse;

import java.util.List;

/**
 * 지하철역 정보를 제공하는 API 컨트롤러입니다.
 * <p>
 * 비즈니스 로직 흐름(Call Graph):
 * 1. 클라이언트(프론트엔드)가 지역 필터링(시/도, 시/군/구) 조건과 함께 지하철역 목록 API를 요청합니다.
 * 2. 컨트롤러가 수신하여 {@link SubwayStationService#getSubwayStations} 메서드를 호출합니다.
 * 3. 서비스 계층에서는 전달된 파라미터를 기반으로 DB에서 매칭되는 지하철역 정보를 필터링하여 조회합니다.
 * 4. 조회된 역 목록(List 형태)을 반환하고, 컨트롤러가 이를 {@link ApiResponse} 래핑하여 응답합니다.
 * </p>
 */
@RestController
@RequiredArgsConstructor
public class SubwayStationController {

    private final SubwayStationService subwayStationService;

    /**
     * 지정된 지역(시/도, 시/군/구)에 위치한 지하철역 목록을 조회합니다.
     * 필터링 조건이 없을 경우 전체(또는 제한된 기본 범위) 역 목록을 반환할 수 있습니다.
     *
     * @param province (선택) 시/도 명 (예: 서울특별시)
     * @param district (선택) 시/군/구 명 (예: 강남구)
     * @return 해당 지역에 속한 지하철역 목록 (지하철역 이름 및 위경도 등의 기본 정보 포함)
     */
    @GetMapping("/api/subway-stations")
    public ApiResponse<List<SubwayStationResponse>> getSubwayStations(
        @RequestParam(required = false) String province,
        @RequestParam(required = false) String district
    ) {
        return ApiResponse.success(subwayStationService.getSubwayStations(province, district));
    }
}

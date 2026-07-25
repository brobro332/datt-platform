package xyz.datt.domain.place.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.place.dto.PlaceMasterSearchResponse;
import xyz.datt.domain.place.service.PlaceMasterService;
import xyz.datt.global.response.ApiResponse;

import java.util.List;

/**
 * 마스터 장소(Place Master) 데이터를 관리하고 조회하는 API 컨트롤러입니다.
 * <p>
 * 비즈니스 로직 흐름(Call Graph):
 * 1. 클라이언트가 장소 마스터 데이터 관련 API를 호출합니다.
 * 2. 해당 컨트롤러의 각 엔드포인트 메서드가 요청을 수신합니다.
 * 3. {@link PlaceMasterService}의 각 비즈니스 로직을 호출하여 처리 결과를 얻습니다.
 *    - searchPlaceMasters(): 키워드, 지역, 카테고리 등을 기준으로 장소를 검색(Slice 페이징 적용).
 *    - getProvinces(): 저장된 데이터 기반으로 시/도 목록을 중복 없이 조회.
 *    - getDistricts(): 특정 시/도에 대한 시/군/구 목록을 중복 없이 조회.
 *    - getRegionCenter(): 특정 시/도 및 시/군/구 지역의 지리적 중심 좌표(위경도)를 산출하여 반환.
 * 4. 서비스의 반환값을 {@link ApiResponse} 형태로 래핑하여 클라이언트에게 JSON 형태로 응답합니다.
 * </p>
 */
@RestController
@RequiredArgsConstructor
public class PlaceMasterController {
    private final PlaceMasterService placeMasterService;

    /**
     * 다양한 검색 조건(키워드, 시/도, 시/군/구, 카테고리)을 기반으로 마스터 장소를 검색합니다.
     *
     * @param keyword  장소 이름 등의 검색어 (선택 사항)
     * @param province 지역 검색을 위한 시/도 명 (선택 사항)
     * @param district 지역 검색을 위한 시/군/구 명 (선택 사항)
     * @param category 필터링을 위한 장소 카테고리 (선택 사항)
     * @param pageable 페이징 처리 정보 (기본값: 20개씩)
     * @return 검색된 장소 마스터 데이터 목록 (무한 스크롤을 위한 Slice 객체 반환)
     */
    @GetMapping("/api/place-masters")
    public ApiResponse<Slice<PlaceMasterSearchResponse>> searchPlaceMasters(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String province,
        @RequestParam(required = false) String district,
        @RequestParam(required = false) String category,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        String searchKeyword = keyword != null ? keyword.trim() : "";
        return ApiResponse.success(placeMasterService.searchPlaceMasters(province, district, searchKeyword, category, pageable));
    }

    /**
     * 마스터 장소 데이터에 존재하는 전체 시/도(Province) 목록을 조회합니다.
     *
     * @return 조회된 시/도 문자열 목록 (리스트 반환)
     */
    @GetMapping("/api/place-masters/provinces")
    public ApiResponse<List<String>> getProvinces() {
        return ApiResponse.success(placeMasterService.getProvinces());
    }

    /**
     * 선택된 특정 시/도(Province) 내에 속한 시/군/구(District) 목록을 조회합니다.
     *
     * @param province 조회하고자 하는 기준 시/도 명
     * @return 해당 시/도에 속하는 시/군/구 문자열 목록
     */
    @GetMapping("/api/place-masters/districts")
    public ApiResponse<List<String>> getDistricts(@RequestParam String province) {
        return ApiResponse.success(placeMasterService.getDistricts(province));
    }

    /**
     * 특정 지역(시/도 및 시/군/구)의 지리적 중심 좌표(위도, 경도)를 계산하여 반환합니다.
     * 프론트엔드 지도 화면의 초기 중심 위치 설정 등에 활용할 수 있습니다.
     *
     * @param province 중심을 찾고자 하는 시/도 명
     * @param district 중심을 찾고자 하는 시/군/구 명
     * @return 중심 좌표 배열 (예: [위도, 경도])
     */
    @GetMapping("/api/place-masters/region-center")
    public ApiResponse<Double[]> getRegionCenter(
        @RequestParam String province,
        @RequestParam String district
    ) {
        return ApiResponse.success(placeMasterService.getRegionCenter(province, district));
    }
}
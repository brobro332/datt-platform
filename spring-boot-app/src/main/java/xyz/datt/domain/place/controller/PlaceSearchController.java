package xyz.datt.domain.place.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.place.dto.PlaceSearchCondition;
import xyz.datt.domain.place.dto.PlaceSearchResponse;
import xyz.datt.domain.place.service.PlaceSearchService;
import xyz.datt.global.response.ApiResponse;

/**
 * 장소 검색 기능과 관련된 API 및 장소 데이터 마이그레이션 API를 제공하는 컨트롤러입니다.
 * <p>
 * 비즈니스 로직 흐름(Call Graph):
 * 1. 일반적인 장소 검색:
 *    - 클라이언트에서 장소 검색 API 호출 (텍스트 기반 검색 등).
 *    - 해당 컨트롤러가 {@link PlaceSearchService#searchPlaces}를 호출.
 *    - DB/Elasticsearch 등의 저장소에서 장소를 검색하고 Page 형태로 반환.
 *    - 응답을 {@link ApiResponse}에 담아 반환.
 * 2. 장소 데이터 마이그레이션 (주로 관리자나 시스템 배치용):
 *    - RDBMS 등의 원본 저장소에서 검색 최적화(예: Elasticsearch) 저장소로 데이터를 이관.
 *    - {@link PlaceSearchService#migratePlaces}를 호출하여 한 번에 주어진 limit 수량만큼 복제 작업 수행.
 * </p>
 */
@RestController
@RequiredArgsConstructor
public class PlaceSearchController {
    private final PlaceSearchService placeSearchService;

    /**
     * 주어진 조건에 맞는 장소 정보를 검색하여 페이징 단위로 조회합니다.
     *
     * @param condition 장소 검색 조건 (검색어, 카테고리, 특정 필터 등)
     * @param pageable  결과 페이지 요청 정보 (페이지 번호, 크기, 정렬 등)
     * @return 검색 조건과 일치하는 장소 응답 객체 목록 (Page 형태)
     */
    @GetMapping("/api/places")
    public ApiResponse<Page<PlaceSearchResponse>> searchPlaces(
        @ModelAttribute PlaceSearchCondition condition,
        Pageable pageable
    ) {
        Page<PlaceSearchResponse> response = placeSearchService.searchPlaces(condition, pageable);

        return ApiResponse.success(response);
    }

    /**
     * 메인 데이터베이스의 장소 데이터를 고속 검색용 인덱스(예: Elasticsearch)로 마이그레이션(이관)합니다.
     * 시스템 성능 향상이나 검색 엔진 동기화가 필요할 때 호출하는 관리용 유틸리티 API입니다.
     *
     * @param limit 한 번의 호출로 마이그레이션할 최대 데이터 건수 (기본값: 20000)
     * @return 마이그레이션 작업 결과 안내 메시지 (성공한 데이터 수 포함)
     */
    @org.springframework.web.bind.annotation.PostMapping("/api/places/migrate")
    public ApiResponse<String> migratePlaces(
        @org.springframework.web.bind.annotation.RequestParam(name = "limit", defaultValue = "20000") int limit
    ) {
        long count = placeSearchService.migratePlaces(limit);
        return ApiResponse.success("Successfully migrated " + count + " places to Elasticsearch.");
    }
}
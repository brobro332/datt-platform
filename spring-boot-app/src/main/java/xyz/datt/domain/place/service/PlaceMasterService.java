package xyz.datt.domain.place.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.place.dto.PlaceMasterSearchResponse;
import xyz.datt.domain.place.dto.PlaceSearchCondition;
import xyz.datt.domain.place.repository.PlaceMasterRepository;

import java.util.List;

/**
 * 상가(장소) 데이터의 검색 및 필터링 등 메인 조회를 담당하는 서비스 클래스입니다.
 * 시/도, 시/군/구 기반의 행정구역 필터링 및 키워드 기반의 장소 검색 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceMasterService {
    private final PlaceMasterRepository placeMasterRepository;
    private final PlaceSearchService placeSearchService;

    /**
     * 주어진 조건(시/도, 시/군/구, 키워드, 카테고리 등)에 따라 상가 목록을 검색합니다.
     * 키워드가 포함된 경우에는 전문 검색(Full-text search 등) 서비스로 위임하고,
     * 그렇지 않은 경우 기본 리포지토리를 통해 데이터를 조회합니다.
     *
     * @param province 시/도 명칭 (예: 서울특별시)
     * @param district 시/군/구 명칭 (예: 강남구)
     * @param keyword 검색어 (상호명 등)
     * @param category 카테고리 필터링
     * @param pageable 페이징 정보
     * @return 검색 조건에 부합하는 장소 정보 DTO의 슬라이스(Slice) 객체
     */
    public Slice<PlaceMasterSearchResponse> searchPlaceMasters(
        String province,
        String district,
        String keyword,
        String category,
        Pageable pageable
    ) {
        PlaceSearchCondition condition = new PlaceSearchCondition();
        condition.setCtprvnNm(province != null && !province.isBlank() ? province : null);
        condition.setSignguNm(district != null && !district.isBlank() ? district : null);
        condition.setKeyword(keyword != null && !keyword.isBlank() ? keyword : null);
        condition.setCategory(category != null && !category.isBlank() ? category : null);

        if (condition.getKeyword() != null && !condition.getKeyword().isBlank()) {
            return placeSearchService.searchPlaces(condition, pageable)
                .map(PlaceMasterSearchResponse::fromSearchResponse);
        }

        return placeMasterRepository.searchPlaceMasters(condition, pageable)
            .map(PlaceMasterSearchResponse::from);
    }

    /**
     * 데이터베이스에 등록된 모든 고유한 시/도(Province) 명칭 목록을 조회합니다.
     *
     * @return 중복을 제거한 시/도 명칭 문자열 리스트
     */
    public List<String> getProvinces() {
        return placeMasterRepository.findUniqueProvinces();
    }

    /**
     * 특정 시/도에 속하는 고유한 시/군/구(District) 명칭 목록을 조회합니다.
     *
     * @param province 기준이 되는 시/도 명칭
     * @return 중복을 제거한 시/군/구 명칭 문자열 리스트
     */
    public List<String> getDistricts(String province) {
        return placeMasterRepository.findUniqueDistricts(province);
    }

    /**
     * 특정 시/도 및 시/군/구 행정구역의 중심 좌표(경도, 위도)를 조회합니다.
     * 지도 API 등에서 초기 뷰포트를 설정할 때 활용할 수 있습니다.
     *
     * @param province 시/도 명칭
     * @param district 시/군/구 명칭
     * @return [경도(Longitude), 위도(Latitude)] 형태의 Double 배열
     */
    public Double[] getRegionCenter(String province, String district) {
        return placeMasterRepository.findRegionCenter(province, district);
    }
}
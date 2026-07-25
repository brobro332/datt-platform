package xyz.datt.domain.anchor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.anchor.entity.AnchorPlaceCategory;
import xyz.datt.domain.place.dto.PlaceNearbyResponse;
import xyz.datt.domain.place.repository.PlaceMasterRepository;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * 앵커 기반의 주변 장소 추천 비즈니스 로직을 처리하는 서비스입니다.
 * <p>
 * 주어진 기준 좌표(위도, 경도)나 특정 지역(시/도, 시/군/구)을 바탕으로,
 * {@link AnchorPlaceCategory}에 정의된 카테고리별 장소를 DB에서 조회하여 반환합니다.
 * </p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnchorRecommendationService {
    private final PlaceMasterRepository placeMasterRepository;

    private static final int DEFAULT_CATEGORY_LIMIT = 10;

    /**
     * 기준 좌표 반경 내의 카테고리별 장소를 추천합니다.
     * <p>
     * {@link AnchorPlaceCategory}의 각 카테고리를 순회하며 해당 카테고리에 속한 장소를
     * 반경(radiusKm) 내에서 검색합니다. 각 카테고리당 최대 {@value DEFAULT_CATEGORY_LIMIT}개의 장소를 조회합니다.
     * </p>
     *
     * @param baseLat  기준 위도
     * @param baseLon  기준 경도
     * @param radiusKm 검색 반경 (km)
     * @return 카테고리별 주변 장소 목록이 담긴 맵 (카테고리 -> 장소 목록)
     */
    public Map<AnchorPlaceCategory, List<PlaceNearbyResponse>> recommendByCategory(
        Double baseLat,
        Double baseLon,
        Double radiusKm
    ) {
        Map<AnchorPlaceCategory, List<PlaceNearbyResponse>> result =
            new EnumMap<>(AnchorPlaceCategory.class);

        for (AnchorPlaceCategory category : AnchorPlaceCategory.values()) {
            List<PlaceNearbyResponse> places =
                placeMasterRepository.findNearbyPlacesForAnchor(
                    baseLat,
                    baseLon,
                    radiusKm,
                    category.getMiddleCategoryCodes(),
                    DEFAULT_CATEGORY_LIMIT
                );

            result.put(category, places);
        }

        return result;
    }

    /**
     * 지정된 지역(시/도, 시/군/구) 내의 카테고리별 장소를 추천합니다.
     * <p>
     * {@link AnchorPlaceCategory}의 각 카테고리를 순회하며 해당 지역에 속한 상위 장소를
     * 카테고리당 최대 {@value DEFAULT_CATEGORY_LIMIT}개씩 DB에서 조회합니다.
     * </p>
     *
     * @param province 광역 자치 단체 (예: 서울특별시)
     * @param district 기초 자치 단체 (예: 강남구)
     * @return 카테고리별 지역 내 장소 목록이 담긴 맵 (카테고리 -> 장소 목록)
     */
    public Map<AnchorPlaceCategory, List<PlaceNearbyResponse>> recommendByRegion(
        String province,
        String district
    ) {
        Map<AnchorPlaceCategory, List<PlaceNearbyResponse>> result =
            new EnumMap<>(AnchorPlaceCategory.class);

        for (AnchorPlaceCategory category : AnchorPlaceCategory.values()) {
            List<PlaceNearbyResponse> places =
                placeMasterRepository.findTopPlacesInRegion(
                    province,
                    district,
                    category.getMiddleCategoryCodes(),
                    DEFAULT_CATEGORY_LIMIT
                );

            result.put(category, places);
        }

        return result;
    }
}
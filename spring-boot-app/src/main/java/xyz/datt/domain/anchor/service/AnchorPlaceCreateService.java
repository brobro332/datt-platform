package xyz.datt.domain.anchor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.anchor.entity.Anchor;
import xyz.datt.domain.anchor.entity.AnchorPlace;
import xyz.datt.domain.anchor.entity.AnchorPlaceCategory;
import xyz.datt.domain.anchor.repository.AnchorPlaceRepository;
import xyz.datt.domain.place.dto.PlaceNearbyResponse;
import xyz.datt.domain.place.entity.PlaceMaster;
import xyz.datt.domain.place.repository.PlaceMasterRepository;
import xyz.datt.domain.place.util.DistanceCalculator;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 정박지 주변의 장소(AnchorPlace)를 생성하고 매핑하는 로직을 담당하는 서비스 클래스입니다.
 * 추천 장소를 기반으로 매핑하거나, 사용자가 직접 선택한 장소들을 거리에 따라 자동 매핑하는 기능 등을 제공합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AnchorPlaceCreateService {
    private final AnchorPlaceRepository anchorPlaceRepository;
    private final PlaceMasterRepository placeMasterRepository;

    /**
     * 외부 추천 시스템 혹은 로직에서 카테고리별로 추천받은 장소들을 정박지에 매핑하여 저장합니다.
     *
     * @param anchor 연관될 대상 정박지 엔티티
     * @param recommendations 카테고리별로 추천된 장소 목록 데이터 (PlaceNearbyResponse 리스트)
     */
    public void createAnchorPlaces(
        Anchor anchor,
        Map<AnchorPlaceCategory, List<PlaceNearbyResponse>> recommendations
    ) {
        recommendations.forEach((category, places) ->
            createCategoryPlaces(anchor, category, places)
        );
    }

    /**
     * 기존 정박지에 연결된 장소들을 일괄 삭제하고, 전달받은 새로운 장소 목록으로 갱신합니다.
     *
     * @param anchor 업데이트 대상 정박지 엔티티
     * @param placeIds 새로 등록할 장소들의 ID 리스트
     */
    public void updateAnchorPlaces(
        Anchor anchor,
        List<Long> placeIds
    ) {
        anchorPlaceRepository.deleteByAnchorId(anchor.getId());
        createCustomAnchorPlaces(anchor, placeIds);
    }

    /**
     * 사용자가 임의로 지정한 장소 ID 목록을 바탕으로 정박지 장소(AnchorPlace)를 생성하여 매핑합니다.
     * <p>
     * 각 장소를 카테고리별로 분류하고, 정박지의 기준 좌표와 해당 장소의 좌표를 이용해
     * 거리를 계산한 후, 거리 순으로 추천 순서(recommendOrder)를 부여하여 저장합니다.
     * </p>
     *
     * @param anchor 연관될 대상 정박지 엔티티
     * @param placeIds 등록할 장소들의 ID 리스트
     */
    public void createCustomAnchorPlaces(
        Anchor anchor,
        List<Long> placeIds
    ) {
        if (placeIds == null || placeIds.isEmpty()) return;

        List<PlaceMaster> places = placeMasterRepository.findAllById(placeIds);
        Map<AnchorPlaceCategory, List<PlaceMaster>> grouped = new HashMap<>();

        for (PlaceMaster pm : places) {
            AnchorPlaceCategory category = AnchorPlaceCategory.fromIndsMclsCd(pm.getIndsMclsCd());
            if (category == null) {
                category = AnchorPlaceCategory.FOOD; // default fallback
            }
            grouped.computeIfAbsent(category, k -> new ArrayList<>()).add(pm);
        }

        grouped.forEach((category, list) -> {
            list.sort(Comparator.comparingDouble(pm ->
                DistanceCalculator.calculateDistanceKm(
                    anchor.getBaseLat(), anchor.getBaseLon(), pm.getLat(), pm.getLon()
                )
            ));

            for (int i = 0; i < list.size(); i++) {
                PlaceMaster pm = list.get(i);
                double distance = DistanceCalculator.calculateDistanceKm(
                    anchor.getBaseLat(), anchor.getBaseLon(), pm.getLat(), pm.getLon()
                );

                AnchorPlace anchorPlace = AnchorPlace.builder()
                    .anchor(anchor)
                    .placeMaster(pm)
                    .category(category)
                    .distanceKm(distance)
                    .recommendOrder(i + 1)
                    .build();

                anchorPlaceRepository.save(anchorPlace);
            }
        });
    }

    private void createCategoryPlaces(
        Anchor anchor,
        AnchorPlaceCategory category,
        List<PlaceNearbyResponse> places
    ) {
        for (int i = 0; i < places.size(); i++) {
            PlaceNearbyResponse response = places.get(i);

            PlaceMaster placeMaster = placeMasterRepository.findById(response.id())
                .orElseThrow(() -> new BusinessException(ErrorCode.PLACE_NOT_FOUND));

            AnchorPlace anchorPlace = AnchorPlace.builder()
                .anchor(anchor)
                .placeMaster(placeMaster)
                .category(category)
                .distanceKm(response.distanceKm())
                .recommendOrder(i + 1)
                .build();

            anchorPlaceRepository.save(anchorPlace);
        }
    }
}
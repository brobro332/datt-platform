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

@Service
@RequiredArgsConstructor
@Transactional
public class AnchorPlaceCreateService {
    private final AnchorPlaceRepository anchorPlaceRepository;
    private final PlaceMasterRepository placeMasterRepository;

    public void createAnchorPlaces(
        Anchor anchor,
        Map<AnchorPlaceCategory, List<PlaceNearbyResponse>> recommendations
    ) {
        recommendations.forEach((category, places) ->
            createCategoryPlaces(anchor, category, places)
        );
    }

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
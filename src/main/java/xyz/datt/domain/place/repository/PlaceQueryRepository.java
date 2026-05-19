package xyz.datt.domain.place.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import xyz.datt.domain.place.dto.PlaceNearbyCondition;
import xyz.datt.domain.place.dto.PlaceNearbyResponse;
import xyz.datt.domain.place.dto.PlaceSearchCondition;
import xyz.datt.domain.place.dto.PlaceSearchResponse;

public interface PlaceQueryRepository {
    Page<PlaceSearchResponse> searchPlaces(
        PlaceSearchCondition condition,
        Pageable pageable
    );

    Page<PlaceNearbyResponse> searchNearbyPlaces(
        PlaceNearbyCondition condition,
        Pageable pageable
    );
}
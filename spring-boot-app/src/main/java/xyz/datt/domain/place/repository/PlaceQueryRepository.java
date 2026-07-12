package xyz.datt.domain.place.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import xyz.datt.domain.place.dto.PlaceNearbyCondition;
import xyz.datt.domain.place.dto.PlaceNearbyResponse;
import xyz.datt.domain.place.dto.PlaceSearchCondition;
import xyz.datt.domain.place.dto.PlaceSearchResponse;
import xyz.datt.domain.place.entity.PlaceMaster;

import java.util.List;

public interface PlaceQueryRepository {
    Slice<PlaceMaster> searchPlaceMasters(
        PlaceSearchCondition condition,
        Pageable pageable
    );

    Page<PlaceSearchResponse> searchPlaces(
        PlaceSearchCondition condition,
        Pageable pageable
    );

    Page<PlaceNearbyResponse> searchNearbyPlaces(
        PlaceNearbyCondition condition,
        Pageable pageable
    );

    List<PlaceNearbyResponse> findNearbyPlacesForAnchor(
        Double baseLat,
        Double baseLon,
        Double radiusKm,
        List<String> indsMclsCodes,
        int limit
    );

    List<String> findUniqueProvinces();
    List<String> findUniqueDistricts(String province);
    Double[] findRegionCenter(String province, String district);

    List<PlaceNearbyResponse> findTopPlacesInRegion(
        String province,
        String district,
        List<String> indsMclsCodes,
        int limit
    );
}
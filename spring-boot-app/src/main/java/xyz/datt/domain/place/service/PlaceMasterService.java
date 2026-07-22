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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceMasterService {
    private final PlaceMasterRepository placeMasterRepository;
    private final PlaceSearchService placeSearchService;

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

    public List<String> getProvinces() {
        return placeMasterRepository.findUniqueProvinces();
    }

    public List<String> getDistricts(String province) {
        return placeMasterRepository.findUniqueDistricts(province);
    }

    public Double[] getRegionCenter(String province, String district) {
        return placeMasterRepository.findRegionCenter(province, district);
    }
}
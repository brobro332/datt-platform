package xyz.datt.domain.place.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import xyz.datt.domain.place.dto.PlaceNearbyCondition;
import xyz.datt.domain.place.dto.PlaceNearbyResponse;
import xyz.datt.domain.place.repository.PlaceMasterRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

/**
 * 특정 지리적 좌표(위경도)를 기준으로 일정 반경(Radius) 내에 위치한 
 * 주변 상가(장소)를 검색하는 기능을 담당하는 서비스 클래스입니다.
 */
@Service
@RequiredArgsConstructor
public class PlaceNearbyService {
    private final PlaceMasterRepository placeMasterRepository;

    /**
     * 주어진 위경도 좌표와 반경(km) 조건을 기반으로 주변 장소를 검색합니다.
     * 유효하지 않은 좌표나 반경이 입력되면 예외를 발생시킵니다.
     *
     * @param condition 중심 좌표와 반경 조건을 포함한 검색 조건 DTO
     * @param pageable 페이징 정보
     * @return 조건에 맞는 주변 장소 응답 DTO를 포함한 페이지(Page) 객체
     */
    public Page<PlaceNearbyResponse> searchNearbyPlaces(
        PlaceNearbyCondition condition,
        Pageable pageable
    ) {
        validateCondition(condition);

        return placeMasterRepository.searchNearbyPlaces(condition, pageable);
    }

    private void validateCondition(PlaceNearbyCondition condition) {
        if (condition.getLon() == null || condition.getLat() == null) {
            throw new BusinessException(ErrorCode.PLACE_INVALID_SEARCH_CONDITION);
        }

        if (condition.getRadiusKm() == null || condition.getRadiusKm() <= 0) {
            throw new BusinessException(ErrorCode.PLACE_INVALID_SEARCH_CONDITION);
        }

        if (condition.getLat() < -90 || condition.getLat() > 90) {
            throw new BusinessException(ErrorCode.PLACE_INVALID_COORDINATE);
        }

        if (condition.getLon() < -180 || condition.getLon() > 180) {
            throw new BusinessException(ErrorCode.PLACE_INVALID_COORDINATE);
        }
    }
}
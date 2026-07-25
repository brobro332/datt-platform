package xyz.datt.domain.place.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.bookmark.entity.PlaceBookmark;
import xyz.datt.domain.bookmark.service.PlaceBookmarkService;
import xyz.datt.domain.place.dto.PlaceDetailResponse;
import xyz.datt.domain.place.entity.PlaceMaster;
import xyz.datt.domain.place.repository.PlaceMasterRepository;
import xyz.datt.domain.review.dto.PlaceRatingSummary;
import xyz.datt.domain.review.service.PlaceReviewService;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

/**
 * 상가(장소)의 상세 정보를 제공하는 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 장소의 기본 정보뿐만 아니라 로그인한 사용자의 북마크 여부, 
 * 해당 장소의 리뷰 평점 요약(평균 평점, 리뷰 수) 등을 조합하여 반환합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceDetailService {
    private final PlaceMasterRepository placeMasterRepository;
    private final PlaceBookmarkService placeBookmarkService;
    private final PlaceReviewService placeReviewService;

    /**
     * 비회원 또는 특정 사용자를 지정하지 않은 상태에서 장소의 상세 정보를 조회합니다.
     * 북마크 여부는 항상 null 또는 false 형태로 반환됩니다.
     *
     * @param placeId 조회할 장소의 고유 식별자
     * @return 장소 상세 정보와 리뷰 평점 요약이 포함된 응답 DTO
     * @throws BusinessException 장소를 찾을 수 없는 경우 발생
     */
    public PlaceDetailResponse getPlaceDetail(Long placeId) {
        PlaceMaster placeMaster = findPlace(placeId);

        PlaceRatingSummary ratingSummary = placeReviewService.getRatingSummary(placeId);

        return PlaceDetailResponse.from(
            placeMaster,
            (PlaceBookmark) null,
            ratingSummary.averageRating(),
            ratingSummary.reviewCount()
        );
    }

    /**
     * 특정 회원의 로그인 상태에서 장소의 상세 정보를 조회합니다.
     * 해당 장소에 대해 로그인한 회원이 북마크를 설정했는지 여부를 함께 반환합니다.
     *
     * @param memberId 조회하는 회원의 고유 식별자
     * @param placeId 조회할 장소의 고유 식별자
     * @return 장소 상세 정보, 해당 회원의 북마크 여부 및 리뷰 평점 요약이 포함된 응답 DTO
     * @throws BusinessException 장소를 찾을 수 없는 경우 발생
     */
    public PlaceDetailResponse getPlaceDetail(Long memberId, Long placeId) {
        PlaceMaster placeMaster = findPlace(placeId);

        PlaceBookmark placeBookmark = placeBookmarkService.getBookmark(memberId, placeId).orElse(null);

        PlaceRatingSummary ratingSummary = placeReviewService.getRatingSummary(placeId);

        return PlaceDetailResponse.from(
            placeMaster,
            placeBookmark,
            ratingSummary.averageRating(),
            ratingSummary.reviewCount()
        );
    }

    private PlaceMaster findPlace(Long placeId) {
        return placeMasterRepository.findById(placeId)
            .orElseThrow(() -> new BusinessException(ErrorCode.PLACE_NOT_FOUND));
    }
}
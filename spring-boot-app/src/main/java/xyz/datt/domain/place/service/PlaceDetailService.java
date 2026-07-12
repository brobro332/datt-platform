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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceDetailService {
    private final PlaceMasterRepository placeMasterRepository;
    private final PlaceBookmarkService placeBookmarkService;
    private final PlaceReviewService placeReviewService;

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
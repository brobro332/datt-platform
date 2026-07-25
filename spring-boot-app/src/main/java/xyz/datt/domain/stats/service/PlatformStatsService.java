package xyz.datt.domain.stats.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.anchor.repository.AnchorRepository;
import xyz.datt.domain.place.repository.PlaceMasterRepository;
import xyz.datt.domain.review.repository.PlaceReviewRepository;
import xyz.datt.domain.stats.dto.PlatformStatsResponse;

/**
 * 플랫폼 전체의 주요 통계 정보를 집계하여 제공하는 서비스 클래스입니다.
 * 등록된 장소, 앵커(지역 거점), 총 리뷰 수 및 플랫폼 전체 평균 리뷰 평점 등의 지표를 계산합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlatformStatsService {

    private final PlaceMasterRepository placeMasterRepository;
    private final AnchorRepository anchorRepository;
    private final PlaceReviewRepository placeReviewRepository;

    /**
     * 플랫폼의 전반적인 운영 지표(장소 개수, 앵커 개수, 누적 리뷰 수, 전체 평균 평점)를 
     * 각 엔티티의 Repository 카운트 쿼리를 통해 집계하여 반환합니다.
     *
     * @return 플랫폼 전체 통계 수치가 담긴 응답 DTO
     */
    public PlatformStatsResponse getPlatformStats() {
        long placeCount = placeMasterRepository.count();
        long anchorCount = anchorRepository.count();
        long reviewCount = placeReviewRepository.count();
        double averageRating = placeReviewRepository.getAverageRatingOfAllReviews();

        return new PlatformStatsResponse(placeCount, anchorCount, reviewCount, averageRating);
    }
}

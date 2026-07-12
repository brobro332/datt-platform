package xyz.datt.domain.stats.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.anchor.repository.AnchorRepository;
import xyz.datt.domain.place.repository.PlaceMasterRepository;
import xyz.datt.domain.review.repository.PlaceReviewRepository;
import xyz.datt.domain.stats.dto.PlatformStatsResponse;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlatformStatsService {

    private final PlaceMasterRepository placeMasterRepository;
    private final AnchorRepository anchorRepository;
    private final PlaceReviewRepository placeReviewRepository;

    public PlatformStatsResponse getPlatformStats() {
        long placeCount = placeMasterRepository.count();
        long anchorCount = anchorRepository.count();
        long reviewCount = placeReviewRepository.count();
        double averageRating = placeReviewRepository.getAverageRatingOfAllReviews();
        
        // If there are no reviews or average is 0, fallback to a satisfying baseline score (e.g. 4.9)
        if (reviewCount == 0 || averageRating == 0.0) {
            averageRating = 4.9;
        }

        return new PlatformStatsResponse(placeCount, anchorCount, reviewCount, averageRating);
    }
}

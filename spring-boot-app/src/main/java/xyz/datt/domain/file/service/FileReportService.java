package xyz.datt.domain.file.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import xyz.datt.domain.review.repository.PlaceReviewRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileReportService {

    private final PlaceReviewRepository reviewRepository;
    private final RestClient restClient = RestClient.create();

    @Transactional
    public void verifyAndRemoveBrokenImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }

        log.info("Verifying reported broken image URL: {}", imageUrl);

        boolean isDead = false;
        try {
            // Send a lightweight HEAD request to check file existence
            restClient.head()
                    .uri(imageUrl)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Reported image URL is still valid: {}", imageUrl);
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("Reported image is confirmed dead (404 Not Found): {}", imageUrl);
            isDead = true;
        } catch (Exception e) {
            // Any other server errors (5xx) or timeouts are not considered "dead" to prevent accidental data deletion
            log.error("Failed to verify image URL due to networking issues: {}", e.getMessage());
        }

        if (isDead) {
            reviewRepository.findByImageUrl(imageUrl).ifPresent(review -> {
                review.clearImageUrl();
                log.info("Successfully cleared dead image URL from PlaceReview ID: {}", review.getId());
            });
        }
    }
}

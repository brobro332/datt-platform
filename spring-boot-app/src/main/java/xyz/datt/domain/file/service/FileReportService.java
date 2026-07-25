package xyz.datt.domain.file.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import xyz.datt.domain.review.repository.PlaceReviewRepository;

/**
 * 파일(이미지 등) 신고와 관련된 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 외부 스토리지나 URL로 제공되는 파일의 유효성을 검증하고, 
 * 유실되거나 깨진 링크(Broken Link)로 판명될 경우 해당 데이터를 정리하는 역할을 수행합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileReportService {

    private final PlaceReviewRepository reviewRepository;
    private final RestClient restClient = RestClient.create();

    /**
     * 신고된 이미지 URL의 유효성을 검증하고, 깨진 이미지인 경우 해당 리뷰의 이미지 URL을 제거합니다.
     * HTTP HEAD 요청을 통해 파일의 존재 여부(404 Not Found)를 확인하며, 
     * 일시적인 네트워크 오류나 5xx 서버 오류 시에는 잘못된 데이터 삭제를 방지하기 위해 처리를 보류합니다.
     *
     * @param imageUrl 검증할 이미지 URL
     */
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

package xyz.datt.domain.review.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import xyz.datt.domain.review.dto.PlaceReviewCreateRequest;
import xyz.datt.domain.review.dto.PlaceReviewResponse;
import xyz.datt.domain.review.dto.PlaceReviewUpdateRequest;
import xyz.datt.domain.review.dto.ProfileReviewResponse;
import xyz.datt.domain.review.service.PlaceReviewService;
import xyz.datt.global.response.ApiResponse;
import xyz.datt.global.security.CustomUserDetails;

/**
 * 장소 리뷰와 관련된 CRUD(생성, 수정, 삭제, 조회) 기능 및 사용자 본인 리뷰 조회 API를 제공하는 컨트롤러입니다.
 * <p>
 * 비즈니스 로직 흐름(Call Graph):
 * 1. 클라이언트가 리뷰 관련 요청을 전송 시 인증된 사용자 정보(@AuthenticationPrincipal)가 함께 넘어옵니다.
 * 2. PlaceReviewController가 이를 처리합니다.
 *    - 리뷰 생성: {@link PlaceReviewService#createReview} (장소 유효성 검사, 리뷰 엔티티 생성, 평점 반영 등)
 *    - 리뷰 수정: {@link PlaceReviewService#updateReview} (본인 확인 검증 후 리뷰 내용 업데이트)
 *    - 리뷰 삭제: {@link PlaceReviewService#deleteReview} (본인 확인 검증 후 리뷰 삭제 처리 및 평점 재계산)
 *    - 장소 리뷰 조회: {@link PlaceReviewService#getPlaceReviews} (특정 장소에 달린 리뷰 목록 조회)
 *    - 내 리뷰 조회: {@link PlaceReviewService#getMyReviews} (인증 사용자가 작성한 리뷰 목록 조회)
 * 3. 각 결과를 {@link ApiResponse} 객체로 감싸서 반환합니다.
 * </p>
 */
@RestController
@RequiredArgsConstructor
public class PlaceReviewController {
    private final PlaceReviewService placeReviewService;

    /**
     * 특정 장소에 대해 새로운 리뷰를 작성합니다.
     *
     * @param userDetails 인증된 사용자 정보 (JWT 등을 통해 주입)
     * @param placeId     리뷰를 작성할 대상 장소의 고유 ID
     * @param request     작성할 리뷰 내용(평점, 텍스트, 이미지 URL 등) 객체
     * @return 생성된 리뷰의 상세 정보 응답
     */
    @PostMapping("/api/places/{placeId}/reviews")
    public ApiResponse<PlaceReviewResponse> createReview(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long placeId,
        @Valid @RequestBody PlaceReviewCreateRequest request
    ) {
        PlaceReviewResponse response = placeReviewService.createReview(
            userDetails.getMemberId(),
            placeId,
            request
        );

        return ApiResponse.success(response);
    }

    /**
     * 작성한 기존 리뷰 내용을 수정합니다. 작성자 본인만 수정이 가능합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param placeId     수정할 리뷰가 속한 장소 ID
     * @param reviewId    수정 대상 리뷰의 고유 ID
     * @param request     수정할 리뷰의 새로운 내용 (평점, 텍스트 등)
     * @return 수정된 이후의 리뷰 상세 정보 응답
     */
    @PatchMapping("/api/places/{placeId}/reviews/{reviewId}")
    public ApiResponse<PlaceReviewResponse> updateReview(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long placeId,
        @PathVariable Long reviewId,
        @Valid @RequestBody PlaceReviewUpdateRequest request
    ) {
        PlaceReviewResponse response = placeReviewService.updateReview(
            userDetails.getMemberId(),
            placeId,
            reviewId,
            request
        );

        return ApiResponse.success(response);
    }

    /**
     * 특정 장소의 내 리뷰를 삭제합니다. 작성자 본인만 삭제할 수 있습니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param placeId     삭제할 리뷰가 속한 장소 ID
     * @param reviewId    삭제 대상 리뷰의 고유 ID
     * @return 삭제 완료 응답 (데이터 본체는 없음)
     */
    @DeleteMapping("/api/places/{placeId}/reviews/{reviewId}")
    public ApiResponse<Void> deleteReview(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long placeId,
        @PathVariable Long reviewId
    ) {
        placeReviewService.deleteReview(
            userDetails.getMemberId(),
            placeId,
            reviewId
        );

        return ApiResponse.success(null);
    }

    /**
     * 특정 장소에 등록된 모든 리뷰 목록을 페이징하여 조회합니다.
     *
     * @param placeId  리뷰를 조회할 장소 고유 ID
     * @param pageable 페이징 요청 객체 (사이즈, 페이지 번호 등)
     * @return 장소에 등록된 리뷰들의 페이징된 응답
     */
    @GetMapping("/api/places/{placeId}/reviews")
    public ApiResponse<Page<PlaceReviewResponse>> getPlaceReviews(
        @PathVariable Long placeId,
        Pageable pageable
    ) {
        Page<PlaceReviewResponse> response = placeReviewService.getPlaceReviews(
            placeId,
            pageable
        );

        return ApiResponse.success(response);
    }

    /**
     * 현재 로그인한 사용자 본인이 작성한 모든 리뷰 목록을 페이징하여 조회합니다.
     * 프로필 화면의 활동 내역 등으로 활용될 수 있습니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param pageable    페이징 요청 객체 (기본값: 10개씩)
     * @return 로그인한 사용자의 작성 리뷰 목록 (프로필 뷰에 최적화된 형식)
     */
    @GetMapping("/api/reviews/my")
    public ApiResponse<Page<ProfileReviewResponse>> getMyReviews(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @org.springframework.data.web.PageableDefault(size = 10) Pageable pageable
    ) {
        Page<ProfileReviewResponse> response = placeReviewService.getMyReviews(
            userDetails.getMemberId(),
            pageable
        );
        return ApiResponse.success(response);
    }
}
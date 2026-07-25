package xyz.datt.domain.review.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.repository.MemberRepository;
import xyz.datt.domain.place.entity.PlaceMaster;
import xyz.datt.domain.place.repository.PlaceMasterRepository;
import xyz.datt.domain.review.dto.PlaceRatingSummary;
import xyz.datt.domain.review.dto.PlaceReviewCreateRequest;
import xyz.datt.domain.review.dto.PlaceReviewResponse;
import xyz.datt.domain.review.dto.PlaceReviewUpdateRequest;
import xyz.datt.domain.review.dto.ProfileReviewResponse;
import xyz.datt.domain.review.entity.PlaceReview;
import xyz.datt.domain.review.repository.PlaceReviewRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

import xyz.datt.domain.gamification.entity.ActivityType;
import xyz.datt.domain.gamification.service.GamificationService;
import lombok.extern.slf4j.Slf4j;
import xyz.datt.global.infrastructure.storage.FileStorageService;

/**
 * 장소(Place) 리뷰 생성, 수정, 삭제, 조회 등 리뷰와 관련된 핵심 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 리뷰 작성 시 게이미피케이션 서비스와 연동하여 사용자의 활동 내역(경험치 획득 등)을 기록하며,
 * 파일 스토리지 서비스와 연동하여 리뷰에 첨부된 이미지의 수명 주기(업로드, 삭제)를 관리합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceReviewService {
    private final PlaceReviewRepository placeReviewRepository;
    private final MemberRepository memberRepository;
    private final PlaceMasterRepository placeMasterRepository;
    private final GamificationService gamificationService;
    private final FileStorageService fileStorageService;
    private final xyz.datt.domain.gamification.repository.MemberTitleRepository memberTitleRepository;

    /**
     * 특정 사용자가 특정 장소에 대한 새로운 리뷰를 생성합니다.
     * 이미 해당 사용자가 작성한 리뷰가 존재하는지 검증하며, 생성 후 게이미피케이션 활동 로그를 남깁니다.
     *
     * @param memberId 리뷰를 작성하는 사용자의 고유 ID
     * @param placeId 리뷰 대상이 되는 장소의 고유 ID
     * @param request 평점, 내용, 이미지 URL 등이 포함된 리뷰 생성 요청 객체
     * @return 생성된 리뷰 정보와 사용자의 선택된 칭호가 포함된 리뷰 응답 DTO
     */
    @Transactional
    public PlaceReviewResponse createReview(
        Long memberId,
        Long placeId,
        PlaceReviewCreateRequest request
    ) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        PlaceMaster placeMaster = placeMasterRepository.findById(placeId)
            .orElseThrow(() -> new BusinessException(ErrorCode.PLACE_NOT_FOUND));

        validateNotReviewed(memberId, placeId);

        PlaceReview review = PlaceReview.builder()
            .member(member)
            .placeMaster(placeMaster)
            .rating(request.rating())
            .content(request.content())
            .imageUrl(request.imageUrl())
            .build();

        PlaceReview savedReview = placeReviewRepository.save(review);

        gamificationService.logActivity(memberId, ActivityType.PLACE_REVIEW_CREATE, "장소 '" + placeMaster.getBizesNm() + "' 리뷰 작성");

        String titleName = memberTitleRepository.findByMemberIdAndSelectedTrue(memberId)
            .map(memberTitle -> memberTitle.getTitle().getName())
            .orElse(null);

        return PlaceReviewResponse.from(savedReview, titleName);
    }

    /**
     * 사용자가 작성했던 기존 리뷰를 수정합니다.
     * 수정 권한(작성자 본인인지) 및 리뷰와 장소의 매칭 여부를 검증합니다.
     * 이미지 URL이 변경되거나 삭제될 경우 스토리지에서 기존 이미지를 제거하여 가비지를 관리합니다.
     *
     * @param memberId 수정 요청을 보낸 사용자의 고유 ID
     * @param placeId 수정할 리뷰가 속한 장소의 고유 ID
     * @param reviewId 수정 대상 리뷰의 고유 ID
     * @param request 변경할 평점, 내용, 새 이미지 URL이 포함된 리뷰 수정 요청 객체
     * @return 수정된 리뷰 정보와 사용자의 칭호가 포함된 리뷰 응답 DTO
     */
    @Transactional
    public PlaceReviewResponse updateReview(
        Long memberId,
        Long placeId,
        Long reviewId,
        PlaceReviewUpdateRequest request
    ) {
        PlaceReview review = placeReviewRepository.findById(reviewId)
            .orElseThrow(() -> new BusinessException(ErrorCode.PLACE_REVIEW_NOT_FOUND));

        validateReviewPlace(review, placeId);
        validateReviewOwner(review, memberId);

        String oldImageUrl = review.getImageUrl();
        String newImageUrl = request.imageUrl();

        review.update(
            request.rating(),
            request.content(),
            newImageUrl
        );

        // If the image changed/was removed, delete the old one from storage
        if (oldImageUrl != null && !oldImageUrl.equals(newImageUrl)) {
            try {
                fileStorageService.deleteFile(oldImageUrl);
            } catch (Exception e) {
                log.warn("Failed to delete garbage review image: {}", oldImageUrl, e);
            }
        }

        String titleName = memberTitleRepository.findByMemberIdAndSelectedTrue(memberId)
            .map(memberTitle -> memberTitle.getTitle().getName())
            .orElse(null);

        return PlaceReviewResponse.from(review, titleName);
    }

    /**
     * 특정 리뷰를 데이터베이스 및 스토리지에서 완전 삭제(Hard Delete)합니다.
     * 삭제 권한(작성자 본인인지) 및 리뷰와 장소의 매칭 여부를 사전에 검증합니다.
     * 삭제 시점에 리뷰에 첨부되었던 이미지 파일이 있다면 스토리지 서버에 삭제를 요청합니다.
     *
     * @param memberId 삭제 요청을 보낸 사용자의 고유 ID
     * @param placeId 삭제할 리뷰가 속한 장소의 고유 ID
     * @param reviewId 삭제 대상 리뷰의 고유 ID
     */
    @Transactional
    public void deleteReview(
        Long memberId,
        Long placeId,
        Long reviewId
    ) {
        PlaceReview review = placeReviewRepository.findById(reviewId)
            .orElseThrow(() -> new BusinessException(ErrorCode.PLACE_REVIEW_NOT_FOUND));

        validateReviewPlace(review, placeId);
        validateReviewOwner(review, memberId);

        placeReviewRepository.delete(review);

        // Delete image from storage when review is deleted
        if (review.getImageUrl() != null) {
            try {
                fileStorageService.deleteFile(review.getImageUrl());
            } catch (Exception e) {
                log.warn("Failed to delete garbage review image: {}", review.getImageUrl(), e);
            }
        }
    }

    /**
     * 특정 장소에 등록된 모든 리뷰 목록을 페이징하여 조회합니다. (생성일자 내림차순 정렬)
     * 각 리뷰 작성자의 현재 활성화된(selected) 칭호 정보도 함께 매핑하여 반환합니다.
     *
     * @param placeId 조회할 장소의 고유 ID
     * @param pageable 페이징 정보
     * @return 해당 장소의 리뷰 정보가 포함된 페이지 객체
     */
    public Page<PlaceReviewResponse> getPlaceReviews(
        Long placeId,
        Pageable pageable
    ) {
        if (!placeMasterRepository.existsById(placeId)) {
            throw new BusinessException(ErrorCode.PLACE_NOT_FOUND);
        }

        return placeReviewRepository
            .findByPlaceMasterIdOrderByCreatedAtDesc(placeId, pageable)
            .map(review -> {
                String titleName = memberTitleRepository.findByMemberIdAndSelectedTrue(review.getMember().getId())
                    .map(memberTitle -> memberTitle.getTitle().getName())
                    .orElse(null);
                return PlaceReviewResponse.from(review, titleName);
            });
    }

    /**
     * 특정 사용자가 작성한 내 리뷰 목록(프로필 용도)을 페이징하여 조회합니다. (생성일자 내림차순 정렬)
     *
     * @param memberId 리뷰를 조회할 사용자의 고유 ID
     * @param pageable 페이징 정보
     * @return 사용자의 프로필에 노출될 리뷰 응답 DTO 페이지 객체
     */
    public Page<ProfileReviewResponse> getMyReviews(
        Long memberId,
        Pageable pageable
    ) {
        if (!memberRepository.existsById(memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        return placeReviewRepository
            .findAllByMemberIdOrderByCreatedAtDesc(memberId, pageable)
            .map(ProfileReviewResponse::from);
    }

    /**
     * 특정 장소의 리뷰 평점 요약(전체 리뷰 수, 평균 평점 등) 정보를 조회합니다.
     *
     * @param placeId 평점 요약을 조회할 장소의 고유 ID
     * @return 장소의 리뷰 통계 및 요약 정보를 담은 DTO
     */
    public PlaceRatingSummary getRatingSummary(Long placeId) {
        if (!placeMasterRepository.existsById(placeId)) {
            throw new BusinessException(ErrorCode.PLACE_NOT_FOUND);
        }

        return placeReviewRepository.getRatingSummaryByPlaceId(placeId);
    }

    private void validateNotReviewed(
        Long memberId,
        Long placeId
    ) {
        if (placeReviewRepository.existsByMemberIdAndPlaceMasterId(memberId, placeId)) {
            throw new BusinessException(ErrorCode.PLACE_REVIEW_ALREADY_EXISTS);
        }
    }

    private void validateReviewPlace(
        PlaceReview review,
        Long placeId
    ) {
        Long reviewPlaceId = review.getPlaceMaster().getId();

        if (placeId != null && reviewPlaceId != null && !reviewPlaceId.equals(placeId)) {
            throw new BusinessException(ErrorCode.PLACE_REVIEW_NOT_FOUND);
        }
    }

    private void validateReviewOwner(
        PlaceReview review,
        Long memberId
    ) {
        Long ownerId = review.getMember().getId();

        if (memberId != null && ownerId != null && !ownerId.equals(memberId)) {
            throw new BusinessException(ErrorCode.PLACE_REVIEW_ACCESS_DENIED);
        }
    }
}
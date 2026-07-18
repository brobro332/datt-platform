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
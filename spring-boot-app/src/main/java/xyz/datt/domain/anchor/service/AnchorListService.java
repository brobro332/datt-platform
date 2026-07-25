package xyz.datt.domain.anchor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.anchor.dto.AnchorSummaryResponse;
import xyz.datt.domain.anchor.entity.Anchor;
import xyz.datt.domain.anchor.entity.AnchorSortType;
import xyz.datt.domain.anchor.repository.AnchorPlaceRepository;
import xyz.datt.domain.anchor.repository.AnchorRepository;

/**
 * 정박지 목록 조회를 담당하는 서비스 클래스입니다.
 * 공개 정박지, 나의 정박지, 인기 정박지 등 다양한 조건에 따른 페이징 목록 조회 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnchorListService {
    private final AnchorRepository anchorRepository;
    private final AnchorPlaceRepository anchorPlaceRepository;
    private final AnchorLikeService anchorLikeService;
    private final xyz.datt.domain.gamification.repository.MemberTitleRepository memberTitleRepository;

    /**
     * 전체 공개된 정박지 목록을 페이징하여 조회합니다.
     * <p>
     * 정렬 조건(인기순, 최신순 등)에 맞춰 데이터를 조회하며, 각 정박지별 포함된 장소 수, 좋아요 수 및
     * 요청한 사용자의 좋아요 여부 등을 포함하여 요약 정보로 반환합니다.
     * </p>
     *
     * @param memberId 조회를 요청하는 회원의 ID (비회원인 경우 좋아요 상태 등을 판별하기 위해 null 처리)
     * @param sortType 조회 시 적용할 정렬 기준 (예: 최신순, 인기순 등)
     * @param pageable 페이징 및 정렬 정보를 담은 객체
     * @return 조회된 정박지 요약 정보의 페이징 결과
     */
    public Page<AnchorSummaryResponse> getPublicAnchors(
        Long memberId,
        AnchorSortType sortType,
        Pageable pageable
    ) {
        Page<Anchor> anchors = sortType == AnchorSortType.POPULAR
            ? anchorRepository.findByIsPublicTrueOrderByViewCountDesc(pageable)
            : anchorRepository.findByIsPublicTrueOrderByCreatedAtDesc(pageable);

        return anchors.map(anchor -> toSummaryResponse(anchor, memberId));
    }

    /**
     * 자신이 생성한 정박지 목록을 페이징하여 조회합니다.
     * 비공개 정박지를 포함하여 해당 회원의 모든 정박지가 정렬 조건에 맞게 조회됩니다.
     *
     * @param memberId 조회할 소유주(회원)의 ID
     * @param sortType 조회 시 적용할 정렬 기준 (예: 최신순, 인기순 등)
     * @param pageable 페이징 및 정렬 정보를 담은 객체
     * @return 조회된 나의 정박지 요약 정보의 페이징 결과
     */
    public Page<AnchorSummaryResponse> getMyAnchors(
        Long memberId,
        AnchorSortType sortType,
        Pageable pageable
    ) {
        Page<Anchor> anchors = sortType == AnchorSortType.POPULAR
            ? anchorRepository.findByMemberIdOrderByViewCountDesc(memberId, pageable)
            : anchorRepository.findByMemberIdOrderByCreatedAtDesc(memberId, pageable);

        return anchors.map(anchor -> toSummaryResponse(anchor, memberId));
    }

    /**
     * 인기 있는 정박지 목록을 조회합니다.
     * 자체적인 인기 정렬 쿼리 혹은 로직을 사용하여 목록을 반환합니다.
     *
     * @param memberId 조회를 요청하는 회원의 ID (비회원 처리는 null)
     * @param pageable 페이징 및 기본 정렬 정보를 담은 객체
     * @return 인기 정박지 요약 정보의 페이징 결과
     */
    public Page<AnchorSummaryResponse> getPopularAnchors(
        Long memberId,
        Pageable pageable
    ) {
        return anchorRepository.findPopularAnchors(pageable)
            .map(anchor -> toSummaryResponse(anchor, memberId));
    }

    private AnchorSummaryResponse toSummaryResponse(
        Anchor anchor,
        Long memberId
    ) {
        int placeCount = anchorPlaceRepository.countByAnchorId(anchor.getId());
        int likeCount = anchorLikeService.countLikes(anchor.getId());

        boolean isLiked = memberId != null
            && anchorLikeService.isLiked(memberId, anchor.getId());

        String nickname = anchor.getMember().getNickname();
        String titleName = memberTitleRepository.findByMemberIdAndSelectedTrue(anchor.getMember().getId())
            .map(memberTitle -> memberTitle.getTitle().getName())
            .orElse(null);

        return AnchorSummaryResponse.from(
            anchor,
            placeCount,
            likeCount,
            isLiked,
            nickname,
            titleName
        );
    }
}
package xyz.datt.domain.anchor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.anchor.dto.AnchorDetailResponse;
import xyz.datt.domain.anchor.dto.AnchorPlaceGroupResponse;
import xyz.datt.domain.anchor.dto.AnchorPlaceResponse;
import xyz.datt.domain.anchor.entity.Anchor;
import xyz.datt.domain.anchor.entity.AnchorPlace;
import xyz.datt.domain.anchor.entity.AnchorPlaceCategory;
import xyz.datt.domain.anchor.repository.AnchorPlaceRepository;
import xyz.datt.domain.anchor.repository.AnchorRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 정박지 상세 정보를 조회하는 비즈니스 로직을 제공하는 서비스 클래스입니다.
 * 조회 시 조회수를 증가시키며, 관련된 장소들을 카테고리별로 그룹화하고, 좋아요 상태 및 회원의 칭호 정보를 함께 반환합니다.
 */
@Service
@RequiredArgsConstructor
public class AnchorDetailService {
    private final AnchorRepository anchorRepository;
    private final AnchorPlaceRepository anchorPlaceRepository;
    private final AnchorLikeService anchorLikeService;
    private final xyz.datt.domain.gamification.repository.MemberTitleRepository memberTitleRepository;

    @Transactional
    /**
     * 특정 정박지의 상세 정보를 조회합니다.
     * <p>
     * 정박지 열람 권한을 검증한 후, 조회수를 1 증가시킵니다.
     * 해당 정박지에 속한 장소들을 카테고리별로 분류하고, 사용자의 좋아요 여부, 소유자의 닉네임 및 대표 칭호를 포함하여 응답 객체를 구성합니다.
     * </p>
     *
     * @param memberId 조회를 요청하는 회원의 ID (비회원일 경우 null 처리 가능 등)
     * @param anchorId 상세 조회할 정박지의 ID
     * @return 정박지의 상세 정보, 포함된 장소 그룹, 좋아요 및 소유자 정보가 담긴 응답 객체
     * @throws BusinessException 정박지를 찾을 수 없거나 열람 권한이 없는 경우 발생
     */
    public AnchorDetailResponse getAnchorDetail(
        Long memberId,
        Long anchorId
    ) {
        Anchor anchor = anchorRepository.findById(anchorId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ANCHOR_NOT_FOUND));

        validateReadable(anchor, memberId);

        anchor.increaseViewCount();

        List<AnchorPlace> anchorPlaces =
                anchorPlaceRepository.findByAnchorIdOrderByCategoryAscRecommendOrderAsc(anchorId);

        List<AnchorPlaceGroupResponse> placeGroups = groupByCategory(anchorPlaces);

        int likeCount = anchorLikeService.countLikes(anchorId);

        boolean isLiked = memberId != null
            && anchorLikeService.isLiked(memberId, anchorId);

        String nickname = anchor.getMember().getNickname();
        String titleName = memberTitleRepository.findByMemberIdAndSelectedTrue(anchor.getMember().getId())
            .map(memberTitle -> memberTitle.getTitle().getName())
            .orElse(null);

        return AnchorDetailResponse.of(
            anchor,
            likeCount,
            isLiked,
            placeGroups,
            nickname,
            titleName
        );
    }

    private void validateReadable(
        Anchor anchor,
        Long memberId
    ) {
        if (anchor.isPublic()) {
            return;
        }

        Long ownerId = anchor.getMember().getId();

        if (memberId == null || ownerId == null || !ownerId.equals(memberId)) {
            throw new BusinessException(ErrorCode.ANCHOR_ACCESS_DENIED);
        }
    }

    private List<AnchorPlaceGroupResponse> groupByCategory(
        List<AnchorPlace> anchorPlaces
    ) {
        Map<AnchorPlaceCategory, List<AnchorPlace>> grouped = anchorPlaces.stream()
            .collect(Collectors.groupingBy(AnchorPlace::getCategory));

        return Arrays.stream(AnchorPlaceCategory.values())
            .map(category -> new AnchorPlaceGroupResponse(
                category,
                category.getDescription(),
                grouped.getOrDefault(category, List.of()).stream()
                    .map(AnchorPlaceResponse::from)
                    .toList()
            ))
            .toList();
    }
}
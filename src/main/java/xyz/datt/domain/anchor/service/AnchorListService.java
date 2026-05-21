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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnchorListService {
    private final AnchorRepository anchorRepository;
    private final AnchorPlaceRepository anchorPlaceRepository;

    public Page<AnchorSummaryResponse> getPublicAnchors(AnchorSortType sortType, Pageable pageable) {
        Page<Anchor> anchors = sortType == AnchorSortType.POPULAR
            ? anchorRepository.findByIsPublicTrueOrderByViewCountDesc(pageable)
            : anchorRepository.findByIsPublicTrueOrderByCreatedAtDesc(pageable);

        return anchors.map(this::toSummaryResponse);
    }

    public Page<AnchorSummaryResponse> getMyAnchors(
        Long memberId,
        AnchorSortType sortType,
        Pageable pageable
    ) {
        Page<Anchor> anchors = sortType == AnchorSortType.POPULAR
            ? anchorRepository.findByMemberIdOrderByViewCountDesc(memberId, pageable)
            : anchorRepository.findByMemberIdOrderByCreatedAtDesc(memberId, pageable);

        return anchors.map(this::toSummaryResponse);
    }

    private AnchorSummaryResponse toSummaryResponse(Anchor anchor) {
        int placeCount = anchorPlaceRepository.countByAnchorId(anchor.getId());

        return AnchorSummaryResponse.from(anchor, placeCount);
    }
}
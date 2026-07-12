package xyz.datt.domain.anchor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.anchor.entity.Anchor;
import xyz.datt.domain.anchor.repository.AnchorLikeRepository;
import xyz.datt.domain.anchor.repository.AnchorPlaceRepository;
import xyz.datt.domain.anchor.repository.AnchorRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

@Service
@RequiredArgsConstructor
@Transactional
public class AnchorDeleteService {

    private final AnchorRepository anchorRepository;
    private final AnchorPlaceRepository anchorPlaceRepository;
    private final AnchorLikeRepository anchorLikeRepository;

    public void deleteAnchor(Long memberId, Long anchorId) {
        Anchor anchor = anchorRepository.findById(anchorId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ANCHOR_NOT_FOUND));

        if (!anchor.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.ANCHOR_ACCESS_DENIED);
        }

        // Delete dependencies first
        anchorPlaceRepository.deleteByAnchorId(anchorId);
        anchorLikeRepository.deleteByAnchorId(anchorId);

        // Delete anchor itself
        anchorRepository.delete(anchor);
    }
}

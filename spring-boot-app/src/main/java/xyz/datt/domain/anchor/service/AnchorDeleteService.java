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

/**
 * 정박지(Anchor) 삭제와 관련된 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 연관된 장소 및 좋아요 데이터를 먼저 삭제한 후 정박지 본체를 삭제하여 외래 키 제약 조건을 만족시킵니다.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AnchorDeleteService {

    private final AnchorRepository anchorRepository;
    private final AnchorPlaceRepository anchorPlaceRepository;
    private final AnchorLikeRepository anchorLikeRepository;

    /**
     * 정박지 및 연관된 모든 데이터를 삭제합니다.
     * <p>
     * 삭제 전 요청한 사용자가 해당 정박지의 소유주인지 검증합니다.
     * 연관된 장소(AnchorPlace)와 좋아요(AnchorLike) 정보를 먼저 삭제하고, 그 다음 정박지 엔티티를 삭제합니다.
     * </p>
     *
     * @param memberId 삭제를 요청한 회원의 ID
     * @param anchorId 삭제할 정박지의 ID
     * @throws BusinessException 정박지가 존재하지 않거나, 삭제 권한이 없는 경우 발생
     */
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

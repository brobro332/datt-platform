package xyz.datt.domain.anchor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.anchor.entity.Anchor;
import xyz.datt.domain.anchor.repository.AnchorRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

/**
 * 앵커의 공개 여부 상태를 변경하는 비즈니스 로직을 처리하는 서비스입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AnchorVisibilityService {

    private final AnchorRepository anchorRepository;

    /**
     * 앵커의 공개/비공개 상태를 전환합니다.
     * <p>
     * 1. 전달받은 앵커 ID로 DB에서 앵커 데이터를 조회합니다.<br>
     * 2. 앵커 소유자와 요청 회원 ID(memberId)가 일치하는지 권한을 검증합니다.<br>
     * 3. 트랜잭션 내 더티 체킹(Dirty Checking)을 활용하여 엔티티의 공개 상태(isPublic)를 수정 반영합니다.
     * </p>
     *
     * @param memberId 요청한 회원의 고유 ID
     * @param anchorId 공개 여부를 변경할 앵커의 고유 ID
     * @param isPublic 공개 여부 (true: 공개, false: 비공개)
     * @throws BusinessException 앵커가 존재하지 않거나, 소유자가 아닐 경우 발생
     */
    public void changeVisibility(Long memberId, Long anchorId, boolean isPublic) {
        Anchor anchor = anchorRepository.findById(anchorId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ANCHOR_NOT_FOUND));

        if (!anchor.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.ANCHOR_ACCESS_DENIED);
        }

        anchor.changeVisibility(isPublic);
    }
}

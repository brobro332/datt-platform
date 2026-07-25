package xyz.datt.domain.anchor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.anchor.entity.Anchor;
import xyz.datt.domain.anchor.repository.AnchorRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

/**
 * 앵커 제목 변경과 관련된 비즈니스 로직을 처리하는 서비스입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AnchorTitleService {

    private final AnchorRepository anchorRepository;

    /**
     * 특정 앵커의 제목을 변경합니다.
     * <p>
     * 1. 입력받은 제목의 유효성(null, 공백)을 검증합니다.<br>
     * 2. 앵커 ID로 DB에서 엔티티를 조회하며, 없을 경우 예외를 발생시킵니다.<br>
     * 3. 앵커의 소유자가 요청한 회원(memberId)과 일치하는지 검증합니다.<br>
     * 4. 조건을 모두 만족하면 트랜잭션 내에서 영속성 컨텍스트의 더티 체킹(Dirty Checking)을 통해 앵커의 제목을 업데이트합니다.
     * </p>
     *
     * @param memberId 요청한 회원의 고유 ID
     * @param anchorId 제목을 변경할 앵커의 고유 ID
     * @param title    새로 설정할 제목
     * @throws BusinessException 제목이 유효하지 않거나, 앵커를 찾을 수 없거나, 소유자가 아닐 경우 발생
     */
    public void changeTitle(Long memberId, Long anchorId, String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        Anchor anchor = anchorRepository.findById(anchorId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ANCHOR_NOT_FOUND));

        if (!anchor.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.ANCHOR_ACCESS_DENIED);
        }

        anchor.changeTitle(title.trim());
    }
}

package xyz.datt.domain.anchor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.anchor.entity.Anchor;
import xyz.datt.domain.anchor.repository.AnchorRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

@Service
@RequiredArgsConstructor
@Transactional
public class AnchorTitleService {

    private final AnchorRepository anchorRepository;

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

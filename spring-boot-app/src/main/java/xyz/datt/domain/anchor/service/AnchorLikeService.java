package xyz.datt.domain.anchor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.anchor.entity.Anchor;
import xyz.datt.domain.anchor.entity.AnchorLike;
import xyz.datt.domain.anchor.repository.AnchorLikeRepository;
import xyz.datt.domain.anchor.repository.AnchorRepository;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.repository.MemberRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

/**
 * 정박지(Anchor)에 대한 '좋아요' 기능을 처리하는 서비스 클래스입니다.
 * 좋아요 추가/취소 및 특정 사용자의 좋아요 여부 확인, 전체 좋아요 수 조회 등을 담당합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnchorLikeService {
    private final AnchorLikeRepository anchorLikeRepository;
    private final AnchorRepository anchorRepository;
    private final MemberRepository memberRepository;

    /**
     * 특정 정박지에 대해 좋아요를 추가합니다.
     *
     * @param memberId 좋아요를 누르는 회원의 ID
     * @param anchorId 좋아요를 받을 정박지의 ID
     * @throws BusinessException 회원이나 정박지가 존재하지 않거나, 이미 좋아요를 누른 상태일 경우 발생
     */
    @Transactional
    public void likeAnchor(Long memberId, Long anchorId) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        Anchor anchor = anchorRepository.findById(anchorId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ANCHOR_NOT_FOUND));

        if (anchorLikeRepository.existsByMemberIdAndAnchorId(memberId, anchorId)) {
            throw new BusinessException(ErrorCode.ANCHOR_LIKE_ALREADY_EXISTS);
        }

        AnchorLike anchorLike = AnchorLike.builder()
            .member(member)
            .anchor(anchor)
            .build();

        anchorLikeRepository.save(anchorLike);
    }

    /**
     * 특정 정박지에 대한 좋아요를 취소(삭제)합니다.
     *
     * @param memberId 좋아요를 취소하는 회원의 ID
     * @param anchorId 좋아요가 취소될 정박지의 ID
     * @throws BusinessException 좋아요 기록을 찾을 수 없는 경우 발생
     */
    @Transactional
    public void unlikeAnchor(Long memberId, Long anchorId) {
        AnchorLike anchorLike = anchorLikeRepository
            .findByMemberIdAndAnchorId(memberId, anchorId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ANCHOR_LIKE_NOT_FOUND));

        anchorLikeRepository.delete(anchorLike);
    }

    /**
     * 특정 사용자가 해당 정박지에 좋아요를 눌렀는지 여부를 확인합니다.
     *
     * @param memberId 확인할 회원의 ID
     * @param anchorId 확인할 정박지의 ID
     * @return 좋아요를 눌렀다면 true, 아니면 false 반환
     */
    public boolean isLiked(Long memberId, Long anchorId) {
        return anchorLikeRepository.existsByMemberIdAndAnchorId(memberId, anchorId);
    }

    /**
     * 특정 정박지가 받은 전체 좋아요 개수를 조회합니다.
     *
     * @param anchorId 조회할 정박지의 ID
     * @return 해당 정박지의 총 좋아요 수
     */
    public int countLikes(Long anchorId) {
        return anchorLikeRepository.countByAnchorId(anchorId);
    }
}
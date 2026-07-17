package xyz.datt.domain.member.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.anchor.dto.ProfileAnchorResponse;
import xyz.datt.domain.anchor.repository.AnchorLikeRepository;
import xyz.datt.domain.anchor.repository.AnchorRepository;
import xyz.datt.domain.bookmark.repository.PlaceBookmarkRepository;
import xyz.datt.domain.gamification.entity.MemberTitle;
import xyz.datt.domain.gamification.policy.LevelPolicy;
import xyz.datt.domain.gamification.repository.MemberAchievementRepository;
import xyz.datt.domain.gamification.repository.MemberTitleRepository;
import xyz.datt.domain.member.dto.MemberActivitySummaryResponse;
import xyz.datt.domain.member.dto.MemberProfileResponse;
import xyz.datt.domain.member.dto.SelectedTitleResponse;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.repository.MemberRepository;
import xyz.datt.domain.review.dto.ProfileReviewResponse;
import xyz.datt.domain.review.repository.PlaceReviewRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberProfileService {

    private final MemberRepository memberRepository;
    private final MemberAchievementRepository memberAchievementRepository;
    private final MemberTitleRepository memberTitleRepository;
    private final PlaceBookmarkRepository placeBookmarkRepository;
    private final PlaceReviewRepository placeReviewRepository;
    private final AnchorRepository anchorRepository;
    private final AnchorLikeRepository anchorLikeRepository;

    public MemberProfileResponse getMyProfile(Long memberId) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        MemberTitle selectedTitle = memberTitleRepository
            .findByMemberIdAndSelectedTrue(memberId)
            .orElse(null);

        int titleCount = memberTitleRepository.findByMemberId(memberId).size();
        int achievementCount = memberAchievementRepository.countByMemberId(memberId);

        long bookmarkCount = placeBookmarkRepository.countByMemberId(memberId);
        long reviewCount = placeReviewRepository.countByMemberId(memberId);
        long anchorCount = anchorRepository.countByMemberId(memberId);
        long receivedLikeCount = anchorLikeRepository.countReceivedLikesByMemberId(memberId);

        List<ProfileAnchorResponse> recentAnchors = anchorRepository
            .findTop3ByMemberIdOrderByCreatedAtDesc(memberId)
            .stream()
            .map(ProfileAnchorResponse::from)
            .toList();

        List<ProfileReviewResponse> recentReviews = placeReviewRepository
            .findTop3ByMemberIdOrderByCreatedAtDesc(memberId)
            .stream()
            .map(ProfileReviewResponse::from)
            .toList();

        return MemberProfileResponse.of(
            member,
            LevelPolicy.getRequiredExpForNextLevel(member.getLevel()),
            SelectedTitleResponse.from(selectedTitle),
            titleCount,
            achievementCount,
            new MemberActivitySummaryResponse(
                bookmarkCount,
                reviewCount,
                anchorCount,
                receivedLikeCount
            ),
            recentAnchors,
            recentReviews
        );
    }

    @Transactional
    public MemberProfileResponse updateNickname(Long memberId, String nickname) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (nickname == null || nickname.trim().isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "닉네임은 공백일 수 없습니다.");
        }

        String trimmedNickname = nickname.trim();

        if (trimmedNickname.equals(member.getNickname())) {
            return getMyProfile(memberId);
        }

        if (memberRepository.existsByNickname(trimmedNickname)) {
            throw new BusinessException(ErrorCode.DUPLICATED_NICKNAME);
        }

        member.updateNickname(trimmedNickname);
        memberRepository.save(member);

        return getMyProfile(memberId);
    }

    @Transactional
    public void withdraw(Long memberId) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        // 1. 회원이 작성한 앵커에 속한 모든 좋아요 일괄 삭제
        anchorLikeRepository.deleteByAnchorMemberId(memberId);

        // 2. 회원이 다른 앵커에 누른 좋아요 삭제
        anchorLikeRepository.deleteByMemberId(memberId);

        // 3. 회원이 작성한 모든 앵커 삭제
        anchorRepository.deleteByMemberId(memberId);

        // 4. 회원이 작성한 모든 리뷰 삭제
        placeReviewRepository.deleteByMemberId(memberId);

        // 5. 회원의 모든 북마크 삭제
        placeBookmarkRepository.deleteByMemberId(memberId);

        // 6. 회원의 모든 칭호 내역 삭제
        memberTitleRepository.deleteByMemberId(memberId);

        // 7. 회원의 모든 업적 내역 삭제
        memberAchievementRepository.deleteByMemberId(memberId);

        // 8. 최종적으로 회원 삭제
        memberRepository.delete(member);
    }
}
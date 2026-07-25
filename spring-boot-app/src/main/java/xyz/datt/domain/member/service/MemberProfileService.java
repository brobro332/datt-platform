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
import org.springframework.data.domain.PageRequest;
import xyz.datt.domain.bookmark.dto.PlaceBookmarkResponse;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.repository.MemberRepository;
import xyz.datt.domain.review.dto.ProfileReviewResponse;
import xyz.datt.domain.review.repository.PlaceReviewRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

import java.util.List;

/**
 * 회원 프로필 정보와 관련된 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 내 프로필 조회, 닉네임 수정, 회원 탈퇴(관련 연관 데이터 일괄 삭제) 등의 기능을 담당합니다.
 */
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

    /**
     * 회원의 상세 프로필 정보를 조회합니다.
     * 프로필에는 회원의 기본 정보, 레벨 및 경험치 상태, 선택된 대표 칭호,
     * 달성한 칭호 및 업적 개수, 활동 요약(북마크, 리뷰, 앵커, 받은 좋아요 수) 및
     * 최근 작성한 앵커, 리뷰, 북마크 목록이 포함됩니다.
     *
     * @param memberId 조회할 회원의 고유 식별자
     * @return 종합적인 회원 프로필 정보가 담긴 응답 DTO
     * @throws BusinessException 회원을 찾을 수 없는 경우 발생
     */
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

        List<PlaceBookmarkResponse> recentBookmarks = placeBookmarkRepository
            .findByMemberIdOrderByCreatedAtDesc(memberId, PageRequest.of(0, 3))
            .stream()
            .map(PlaceBookmarkResponse::from)
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
            recentReviews,
            recentBookmarks
        );
    }

    /**
     * 회원의 닉네임을 변경합니다.
     * 공백 검사 및 중복 닉네임 검증을 수행하며, 변경이 완료되면 최신 프로필 정보를 반환합니다.
     *
     * @param memberId 닉네임을 변경할 회원의 고유 식별자
     * @param nickname 새롭게 설정할 닉네임 문자열
     * @return 닉네임 변경이 반영된 회원 프로필 응답 DTO
     * @throws BusinessException 회원이 없거나, 닉네임이 공백이거나, 이미 존재하는 닉네임일 경우 발생
     */
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

    /**
     * 회원 탈퇴 처리를 수행합니다.
     * 회원이 작성한 모든 콘텐츠(앵커, 앵커 좋아요, 리뷰, 북마크, 칭호, 업적 등)를
     * 데이터베이스에서 일괄 삭제한 뒤, 최종적으로 회원 계정 데이터를 삭제합니다.
     *
     * @param memberId 탈퇴할 회원의 고유 식별자
     * @throws BusinessException 탈퇴하려는 회원을 찾을 수 없는 경우 발생
     */
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
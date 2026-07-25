package xyz.datt.domain.gamification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.anchor.repository.AnchorLikeRepository;
import xyz.datt.domain.anchor.repository.AnchorRepository;
import xyz.datt.domain.bookmark.repository.PlaceBookmarkRepository;
import xyz.datt.domain.gamification.dto.MemberAchievementResponse;
import xyz.datt.domain.gamification.dto.MemberActivityLogResponse;
import xyz.datt.domain.gamification.dto.MemberTitleResponse;
import xyz.datt.domain.gamification.entity.*;
import xyz.datt.domain.gamification.repository.*;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.repository.MemberRepository;
import xyz.datt.domain.review.repository.PlaceReviewRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 플랫폼 내의 게임화(Gamification) 요소인 경험치(EXP), 칭호(Title), 업적(Achievement) 및
 * 사용자 활동 로그(Activity Log)를 관리하는 서비스 클래스입니다.
 * 
 * 사용자 활동에 따른 경험치 부여, 조건 충족 시 칭호 및 업적 잠금 해제 등 
 * 플랫폼의 사용자 참여도를 높이기 위한 핵심 비즈니스 로직을 처리합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GamificationService {

    private final MemberRepository memberRepository;
    private final MemberActivityLogRepository memberActivityLogRepository;
    private final MemberTitleRepository memberTitleRepository;
    private final MemberAchievementRepository memberAchievementRepository;
    private final TitleRepository titleRepository;
    private final AchievementRepository achievementRepository;

    private final PlaceBookmarkRepository placeBookmarkRepository;
    private final PlaceReviewRepository placeReviewRepository;
    private final AnchorRepository anchorRepository;
    private final AnchorLikeRepository anchorLikeRepository;

    /**
     * 특정 회원의 활동 로그 내역을 페이징하여 조회합니다.
     * 최신 활동순으로 정렬되어 반환됩니다.
     *
     * @param memberId 조회할 회원의 고유 식별자
     * @param pageable 페이징 정보 (페이지 번호, 크기 등)
     * @return 활동 로그 응답 DTO를 포함한 페이지(Page) 객체
     */
    public Page<MemberActivityLogResponse> getMyActivityLogs(Long memberId, Pageable pageable) {
        return memberActivityLogRepository.findByMemberIdOrderByCreatedAtDesc(memberId, pageable)
            .map(MemberActivityLogResponse::from);
    }

    /**
     * 특정 회원이 보유한 칭호 목록을 전체 조회합니다.
     * 최초 조회 시 기본 칭호(초보 탐험가)가 없는 경우, 이를 자동으로 잠금 해제하여 부여합니다.
     *
     * @param memberId 조회할 회원의 고유 식별자
     * @return 회원이 보유한 칭호 응답 DTO 리스트
     */
    @Transactional
    public List<MemberTitleResponse> getMyTitles(Long memberId) {
        // Automatically unlock beginner explorer if they don't have it yet
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        if (!memberTitleRepository.existsByMemberIdAndTitleCode(memberId, TitleCode.BEGINNER_EXPLORER.name())) {
            unlockTitle(member, TitleCode.BEGINNER_EXPLORER);
        }

        return memberTitleRepository.findByMemberId(memberId).stream()
            .map(MemberTitleResponse::from)
            .toList();
    }

    /**
     * 시스템 내의 전체 업적 목록과 함께 특정 회원의 업적 달성 여부를 조회합니다.
     *
     * @param memberId 조회할 회원의 고유 식별자
     * @return 회원의 달성 상태가 포함된 전체 업적 응답 DTO 리스트
     */
    public List<MemberAchievementResponse> getMyAchievements(Long memberId) {
        List<Achievement> allAchievements = achievementRepository.findAll();
        List<MemberAchievement> unlocked = memberAchievementRepository.findByMemberId(memberId);

        Map<Long, MemberAchievement> unlockedMap = unlocked.stream()
            .collect(Collectors.toMap(ma -> ma.getAchievement().getId(), Function.identity()));

        return allAchievements.stream()
            .map(achievement -> MemberAchievementResponse.of(achievement, unlockedMap.get(achievement.getId())))
            .toList();
    }

    /**
     * 회원이 사용할 대표 칭호를 선택(변경)합니다.
     * 기존에 선택된 칭호는 해제되고, 새로 지정한 칭호만 선택 상태로 활성화됩니다.
     *
     * @param memberId 칭호를 변경할 회원의 고유 식별자
     * @param titleId 선택할 칭호의 고유 식별자
     * @return 변경된 대표 칭호 응답 DTO
     * @throws BusinessException 회원이 보유하지 않은 칭호를 선택하려고 할 경우 발생
     */
    @Transactional
    public MemberTitleResponse selectMyTitle(Long memberId, Long titleId) {
        List<MemberTitle> titles = memberTitleRepository.findByMemberId(memberId);

        MemberTitle targetTitle = titles.stream()
            .filter(t -> t.getTitle().getId().equals(titleId))
            .findFirst()
            .orElseThrow(() -> new BusinessException(ErrorCode.PLACE_INVALID_SEARCH_CONDITION));

        for (MemberTitle t : titles) {
            if (t.getId().equals(targetTitle.getId())) {
                t.select();
            } else {
                t.unselect();
            }
        }

        memberTitleRepository.saveAll(titles);
        return MemberTitleResponse.from(targetTitle);
    }

    /**
     * 회원의 특정 활동을 기록하고, 해당 활동에 따른 경험치를 부여합니다.
     * 이후 해당 활동으로 인해 새롭게 달성 가능한 업적 및 칭호가 있는지 검사하여 잠금 해제 로직을 수행합니다.
     *
     * @param memberId 활동을 수행한 회원의 고유 식별자
     * @param type 수행한 활동의 종류(ActivityType)
     * @param description 활동에 대한 상세 설명 및 로그 메시지
     * @throws BusinessException 회원을 찾을 수 없는 경우 발생
     */
    @Transactional
    public void logActivity(Long memberId, ActivityType type, String description) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        int expAmount = type.getExp();
        member.addExp(expAmount);
        memberRepository.save(member);

        MemberActivityLog log = MemberActivityLog.builder()
            .member(member)
            .activityType(type)
            .expAmount(expAmount)
            .description(description)
            .build();
        memberActivityLogRepository.save(log);

        checkAndUnlockAchievements(member, type);
        checkAndUnlockTitles(member, type);
    }

    private void checkAndUnlockAchievements(Member member, ActivityType type) {
        Long memberId = member.getId();

        if (type == ActivityType.BOOKMARK_ADD) {
            long count = placeBookmarkRepository.countByMemberId(memberId);
            if (count >= 30) {
                tryUnlock(member, AchievementCode.BOOKMARK_30, type);
            }
            if (count >= 10) {
                tryUnlock(member, AchievementCode.BOOKMARK_10, type);
            }
            if (count >= 3) {
                tryUnlock(member, AchievementCode.BOOKMARK_3, type);
            }
            if (count >= 1) {
                tryUnlock(member, AchievementCode.FIRST_BOOKMARK, type);
            }
        } else if (type == ActivityType.PLACE_REVIEW_CREATE) {
            long count = placeReviewRepository.countByMemberId(memberId);
            if (count >= 30) {
                tryUnlock(member, AchievementCode.REVIEW_30, type);
            }
            if (count >= 10) {
                tryUnlock(member, AchievementCode.REVIEW_10, type);
            }
            if (count >= 3) {
                tryUnlock(member, AchievementCode.REVIEW_3, type);
            }
            if (count >= 1) {
                tryUnlock(member, AchievementCode.FIRST_REVIEW, type);
            }
        } else if (type == ActivityType.ANCHOR_CREATE) {
            long count = anchorRepository.countByMemberId(memberId);
            if (count >= 30) {
                tryUnlock(member, AchievementCode.ANCHOR_30, type);
            }
            if (count >= 10) {
                tryUnlock(member, AchievementCode.ANCHOR_10, type);
            }
            if (count >= 3) {
                tryUnlock(member, AchievementCode.ANCHOR_3, type);
            }
            if (count >= 1) {
                tryUnlock(member, AchievementCode.FIRST_ANCHOR, type);
            }
        } else if (type == ActivityType.ANCHOR_LIKE_RECEIVED) {
            long count = anchorLikeRepository.countReceivedLikesByMemberId(memberId);
            if (count >= 50) {
                tryUnlock(member, AchievementCode.ANCHOR_LIKE_50, type);
            }
            if (count >= 15) {
                tryUnlock(member, AchievementCode.ANCHOR_LIKE_15, type);
            }
            if (count >= 5) {
                tryUnlock(member, AchievementCode.ANCHOR_LIKE_5, type);
            }
            if (count >= 1) {
                tryUnlock(member, AchievementCode.FIRST_ANCHOR_LIKE, type);
            }
        }
    }

    private void tryUnlock(Member member, AchievementCode code, ActivityType type) {
        Long memberId = member.getId();
        String codeStr = code.name();
        if (!memberAchievementRepository.existsByMemberIdAndAchievementCode(memberId, codeStr)) {
            Achievement achievement = achievementRepository.findByCode(codeStr)
                .orElseThrow(() -> new BusinessException(ErrorCode.PLACE_INVALID_SEARCH_CONDITION));

            MemberAchievement memberAchievement = MemberAchievement.builder()
                .member(member)
                .achievement(achievement)
                .build();
            memberAchievementRepository.save(memberAchievement);

            member.addExp(achievement.getRewardExp());
            memberRepository.save(member);

            MemberActivityLog achievementLog = MemberActivityLog.builder()
                .member(member)
                .activityType(type)
                .expAmount(achievement.getRewardExp())
                .description("업적 달성: [" + achievement.getDescription() + "]")
                .build();
            memberActivityLogRepository.save(achievementLog);
        }
    }

    private void checkAndUnlockTitles(Member member, ActivityType type) {
        Long memberId = member.getId();
        TitleCode codeToUnlock = null;

        if (type == ActivityType.BOOKMARK_ADD) {
            long bookmarkCount = placeBookmarkRepository.countByMemberId(memberId);
            if (bookmarkCount >= 5) {
                codeToUnlock = TitleCode.PLACE_COLLECTOR;
            }
        } else if (type == ActivityType.PLACE_REVIEW_CREATE) {
            long reviewCount = placeReviewRepository.countByMemberId(memberId);
            if (reviewCount >= 3) {
                codeToUnlock = TitleCode.REVIEW_WRITER;
            }
        } else if (type == ActivityType.ANCHOR_CREATE) {
            long anchorCount = anchorRepository.countByMemberId(memberId);
            if (anchorCount >= 2) {
                codeToUnlock = TitleCode.ANCHOR_CREATOR;
            }
        }

        if (codeToUnlock != null) {
            unlockTitle(member, codeToUnlock);
        }
    }

    private void unlockTitle(Member member, TitleCode code) {
        Long memberId = member.getId();
        if (!memberTitleRepository.existsByMemberIdAndTitleCode(memberId, code.name())) {
            Title title = titleRepository.findByCode(code.name())
                .orElseThrow(() -> new BusinessException(ErrorCode.PLACE_INVALID_SEARCH_CONDITION));

            MemberTitle memberTitle = MemberTitle.builder()
                .member(member)
                .title(title)
                .selected(false)
                .build();
            memberTitleRepository.save(memberTitle);
        }
    }
}

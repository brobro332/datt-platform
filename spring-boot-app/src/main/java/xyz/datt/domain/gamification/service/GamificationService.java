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

    public Page<MemberActivityLogResponse> getMyActivityLogs(Long memberId, Pageable pageable) {
        return memberActivityLogRepository.findByMemberIdOrderByCreatedAtDesc(memberId, pageable)
            .map(MemberActivityLogResponse::from);
    }

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

    public List<MemberAchievementResponse> getMyAchievements(Long memberId) {
        List<Achievement> allAchievements = achievementRepository.findAll();
        List<MemberAchievement> unlocked = memberAchievementRepository.findByMemberId(memberId);

        Map<Long, MemberAchievement> unlockedMap = unlocked.stream()
            .collect(Collectors.toMap(ma -> ma.getAchievement().getId(), Function.identity()));

        return allAchievements.stream()
            .map(achievement -> MemberAchievementResponse.of(achievement, unlockedMap.get(achievement.getId())))
            .toList();
    }

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

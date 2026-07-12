package xyz.datt.domain.gamification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.gamification.entity.Achievement;
import xyz.datt.domain.gamification.entity.AchievementCode;
import xyz.datt.domain.gamification.entity.Title;
import xyz.datt.domain.gamification.entity.TitleCode;
import xyz.datt.domain.gamification.repository.AchievementRepository;
import xyz.datt.domain.gamification.repository.TitleRepository;

@Component
@RequiredArgsConstructor
public class GamificationSeeder implements ApplicationRunner {

    private final TitleRepository titleRepository;
    private final AchievementRepository achievementRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        // Seed Titles
        for (TitleCode code : TitleCode.values()) {
            if (titleRepository.findByCode(code.name()).isEmpty()) {
                titleRepository.save(Title.builder()
                    .code(code.name())
                    .name(code.getTitleName())
                    .description(code.getDescription())
                    .build());
            }
        }

        // Seed Achievements
        for (AchievementCode code : AchievementCode.values()) {
            if (achievementRepository.findByCode(code.name()).isEmpty()) {
                int rewardExp = switch (code) {
                    case FIRST_BOOKMARK -> 10;
                    case BOOKMARK_3 -> 15;
                    case BOOKMARK_10 -> 25;
                    case BOOKMARK_30 -> 50;

                    case FIRST_REVIEW -> 15;
                    case REVIEW_3 -> 20;
                    case REVIEW_10 -> 30;
                    case REVIEW_30 -> 60;

                    case FIRST_ANCHOR -> 20;
                    case ANCHOR_3 -> 30;
                    case ANCHOR_10 -> 45;
                    case ANCHOR_30 -> 80;

                    case FIRST_ANCHOR_LIKE -> 25;
                    case ANCHOR_LIKE_5 -> 35;
                    case ANCHOR_LIKE_15 -> 50;
                    case ANCHOR_LIKE_50 -> 100;
                };
                achievementRepository.save(Achievement.builder()
                    .code(code.name())
                    .name(code.name())
                    .description(code.getDescription())
                    .rewardExp(rewardExp)
                    .build());
            }
        }
    }
}

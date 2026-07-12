package xyz.datt.domain.gamification.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.anchor.dto.AnchorCreateRequest;
import xyz.datt.domain.anchor.service.AnchorCreateService;
import xyz.datt.domain.bookmark.service.PlaceBookmarkService;
import xyz.datt.domain.gamification.entity.AchievementCode;
import xyz.datt.domain.gamification.entity.MemberActivityLog;
import xyz.datt.domain.gamification.entity.TitleCode;
import xyz.datt.domain.gamification.repository.MemberAchievementRepository;
import xyz.datt.domain.gamification.repository.MemberActivityLogRepository;
import xyz.datt.domain.gamification.repository.MemberTitleRepository;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.repository.MemberRepository;
import xyz.datt.domain.place.entity.PlaceMaster;
import xyz.datt.domain.place.repository.PlaceMasterRepository;
import xyz.datt.domain.review.dto.PlaceReviewCreateRequest;
import xyz.datt.domain.review.service.PlaceReviewService;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class GamificationServiceIntegrationTest {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private PlaceMasterRepository placeMasterRepository;

    @Autowired
    private PlaceBookmarkService placeBookmarkService;

    @Autowired
    private PlaceReviewService placeReviewService;

    @Autowired
    private AnchorCreateService anchorCreateService;

    @Autowired
    private MemberActivityLogRepository memberActivityLogRepository;

    @Autowired
    private MemberAchievementRepository memberAchievementRepository;

    @Autowired
    private MemberTitleRepository memberTitleRepository;

    @Test
    @DisplayName("사용자의 활동에 따라 실시간으로 경험치가 누적되고, 활동로그 및 업적/칭호가 해금되는가?")
    void testGamificationIntegrationLoop() {
        // 1. 회원 및 장소 생성
        Member member = memberRepository.save(Member.createUser("gamer@test.com", "pass", "gamer"));
        Long memberId = member.getId();

        PlaceMaster p1 = placeMasterRepository.save(createPlaceMaster("BIZ-001", "스타벅스 강남점"));
        PlaceMaster p2 = placeMasterRepository.save(createPlaceMaster("BIZ-002", "투썸플레이스 강남점"));
        PlaceMaster p3 = placeMasterRepository.save(createPlaceMaster("BIZ-003", "할리스 강남점"));
        PlaceMaster p4 = placeMasterRepository.save(createPlaceMaster("BIZ-004", "이디야 강남점"));
        PlaceMaster p5 = placeMasterRepository.save(createPlaceMaster("BIZ-005", "메가커피 강남점"));

        // 2. 장소 1개 북마크 추가
        placeBookmarkService.addBookmark(memberId, p1.getId(), List.of());

        // 회원 EXP 및 레벨 체크
        // 북마크 추가: +5 EXP
        // 첫 북마크 달성 업적 해금: +10 EXP
        // 총 15 EXP가 적재되어야 함
        Member updatedMember = memberRepository.findById(memberId).orElseThrow();
        assertThat(updatedMember.getExp()).isEqualTo(15);

        // 활동로그 적재 체크 (BOOKMARK_ADD와 업적 달성 로그까지 총 2개)
        List<MemberActivityLog> logs = memberActivityLogRepository.findAll().stream()
            .filter(log -> log.getMember().getId().equals(memberId))
            .toList();
        assertThat(logs).hasSize(2);

        // 업적 해금 체크
        boolean hasFirstBookmarkAch = memberAchievementRepository
            .existsByMemberIdAndAchievementCode(memberId, AchievementCode.FIRST_BOOKMARK.name());
        assertThat(hasFirstBookmarkAch).isTrue();

        // 3. 장소 4개 추가 북마크 (총 5개) -> "장소 수집가" 칭호 획득 검증
        placeBookmarkService.addBookmark(memberId, p2.getId(), List.of());
        placeBookmarkService.addBookmark(memberId, p3.getId(), List.of());
        placeBookmarkService.addBookmark(memberId, p4.getId(), List.of());
        placeBookmarkService.addBookmark(memberId, p5.getId(), List.of());

        // 5개 북마크 도달 시 PLACE_COLLECTOR 칭호가 자동 해금되어야 함
        boolean hasCollectorTitle = memberTitleRepository
            .existsByMemberIdAndTitleCode(memberId, TitleCode.PLACE_COLLECTOR.name());
        assertThat(hasCollectorTitle).isTrue();

        // 4. 리뷰 작성 -> +15 EXP 및 "첫 리뷰 작성" 업적 해금 (+15 EXP) 검증
        placeReviewService.createReview(memberId, p1.getId(), new PlaceReviewCreateRequest(5, "정말 훌륭합니다!", null));

        updatedMember = memberRepository.findById(memberId).orElseThrow();
        // 기존 5개 북마크 (5 * 5 = 25 EXP) + 첫 북마크 업적 (10 EXP) + 3회 북마크 업적 (15 EXP) = 50 EXP
        // 리뷰 작성 (15 EXP) + 첫 리뷰 업적 (15 EXP) = 30 EXP
        // 총 50 + 30 = 80 EXP
        assertThat(updatedMember.getExp()).isEqualTo(80);

        boolean hasFirstReviewAch = memberAchievementRepository
            .existsByMemberIdAndAchievementCode(memberId, AchievementCode.FIRST_REVIEW.name());
        assertThat(hasFirstReviewAch).isTrue();

        // 5. 닻(Anchor) 생성 -> +30 EXP 및 "첫 Anchor 생성" 업적 해금 (+20 EXP) 검증
        anchorCreateService.createAnchor(memberId, new AnchorCreateRequest(
            "강남구 닻",
            "강남구",
            "서울특별시 강남구",
            127.0276,
            37.4979,
            3.0,
            true
        ));

        updatedMember = memberRepository.findById(memberId).orElseThrow();
        // 닻 생성 (30 EXP) + 첫 닻 업적 (20 EXP) = 50 EXP 추가
        // 총 80 + 50 = 130 EXP
        assertThat(updatedMember.getExp()).isEqualTo(130);

        boolean hasFirstAnchorAch = memberAchievementRepository
            .existsByMemberIdAndAchievementCode(memberId, AchievementCode.FIRST_ANCHOR.name());
        assertThat(hasFirstAnchorAch).isTrue();
    }

    private PlaceMaster createPlaceMaster(String bizId, String name) {
        return PlaceMaster.builder()
            .bizesId(bizId)
            .bizesNm(name)
            .brchNm("지점")
            .indsLclsCd("I2")
            .indsLclsNm("음식")
            .indsMclsCd("I212")
            .indsMclsNm("비알코올")
            .indsSclsCd("I21201")
            .indsSclsNm("카페")
            .ctprvnNm("서울특별시")
            .signguNm("강남구")
            .adongNm("역삼동")
            .ldongNm("역삼동")
            .lnoAdr("서울특별시 강남구 역삼동 123-1")
            .rdnmAdr("서울특별시 강남구 테헤란로 123")
            .newZipcd("06123")
            .lon(127.0276)
            .lat(37.4979)
            .location("POINT(127.0276 37.4979)")
            .build();
    }
}

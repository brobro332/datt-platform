package xyz.datt.domain.bookmark.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.bookmark.dto.PlaceBookmarkResponse;
import xyz.datt.domain.bookmark.entity.BookmarkFolder;
import xyz.datt.domain.bookmark.entity.PlaceBookmark;
import xyz.datt.domain.bookmark.repository.BookmarkFolderRepository;
import xyz.datt.domain.bookmark.repository.PlaceBookmarkRepository;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.repository.MemberRepository;
import xyz.datt.domain.place.entity.PlaceMaster;
import xyz.datt.domain.place.repository.PlaceMasterRepository;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PlaceBookmarkServiceIntegrationTest {

    @Autowired
    private PlaceBookmarkService placeBookmarkService;

    @Autowired
    private PlaceBookmarkRepository placeBookmarkRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private PlaceMasterRepository placeMasterRepository;

    @Autowired
    private BookmarkFolderRepository bookmarkFolderRepository;

    @Test
    @DisplayName("북마크를 생성한 뒤 여러 폴더를 지정 및 변경한다.")
    void testAddAndChangeBookmarkFolders() {
        // Given
        Member member = memberRepository.save(Member.createUser("test@test.com", "pass", "nickname"));
        PlaceMaster placeMaster = placeMasterRepository.save(createPlaceMaster());
        BookmarkFolder folder1 = bookmarkFolderRepository.save(BookmarkFolder.builder().member(member).name("폴더1").build());
        BookmarkFolder folder2 = bookmarkFolderRepository.save(BookmarkFolder.builder().member(member).name("폴더2").build());

        // When (Save with 2 folders)
        PlaceBookmarkResponse response = placeBookmarkService.addBookmark(
            member.getId(),
            placeMaster.getId(),
            List.of(folder1.getId(), folder2.getId())
        );

        // Then
        assertThat(response.folders()).hasSize(2);

        PlaceBookmark bookmark = placeBookmarkRepository.findByMemberIdAndPlaceMasterId(member.getId(), placeMaster.getId()).orElseThrow();
        assertThat(bookmark.getBookmarkFolders()).hasSize(2);

        // When (Update to 1 folder)
        PlaceBookmarkResponse responseUpdate = placeBookmarkService.addBookmark(
            member.getId(),
            placeMaster.getId(),
            List.of(folder1.getId())
        );

        // Then
        assertThat(responseUpdate.folders()).hasSize(1);
        assertThat(responseUpdate.folders().get(0).name()).isEqualTo("폴더1");

        // Clear persistence context to verify real DB load
        bookmarkFolderRepository.flush();
        placeBookmarkRepository.flush();

        PlaceBookmark bookmarkUpdated = placeBookmarkRepository.findByMemberIdAndPlaceMasterId(member.getId(), placeMaster.getId()).orElseThrow();
        assertThat(bookmarkUpdated.getBookmarkFolders()).hasSize(1);
    }

    private PlaceMaster createPlaceMaster() {
        return PlaceMaster.builder()
            .bizesId("BIZ-001")
            .bizesNm("스타벅스 강남점")
            .brchNm("강남점")
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

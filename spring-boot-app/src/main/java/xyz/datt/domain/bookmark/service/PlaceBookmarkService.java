package xyz.datt.domain.bookmark.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
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
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

import xyz.datt.domain.gamification.entity.ActivityType;
import xyz.datt.domain.gamification.service.GamificationService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * 개별 장소(Place)에 대한 북마크 추가, 삭제, 조회 등 
 * 장소 북마크 비즈니스 로직을 처리하는 서비스입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceBookmarkService {
    private final PlaceBookmarkRepository placeBookmarkRepository;
    private final MemberRepository memberRepository;
    private final PlaceMasterRepository placeMasterRepository;
    private final BookmarkFolderRepository bookmarkFolderRepository;
    private final GamificationService gamificationService;

    /**
     * 장소를 기본 폴더(또는 폴더 지정 없이)에 북마크로 추가합니다.
     *
     * @param memberId 사용자 ID
     * @param placeId 북마크할 장소 ID
     * @return 추가된 북마크 응답 DTO
     */
    @Transactional
    public PlaceBookmarkResponse addBookmark(
        Long memberId,
        Long placeId
    ) {
        return addBookmark(memberId, placeId, List.of());
    }

    /**
     * 장소를 특정 폴더 하나에 지정하여 북마크로 추가합니다.
     *
     * @param memberId 사용자 ID
     * @param placeId 북마크할 장소 ID
     * @param folderId 저장할 폴더 ID
     * @return 추가된 북마크 응답 DTO
     */
    @Transactional
    public PlaceBookmarkResponse addBookmark(
        Long memberId,
        Long placeId,
        Long folderId
    ) {
        return addBookmark(memberId, placeId, folderId != null ? List.of(folderId) : List.of());
    }

    /**
     * 특정 장소를 하나 이상의 폴더에 담아 북마크로 추가(또는 갱신)합니다.
     * <p>
     * 1. 회원과 장소 엔티티의 유효성을 검증합니다.<br>
     * 2. 전달된 폴더 ID 리스트를 순회하며 회원이 소유한 폴더가 맞는지 확인합니다.<br>
     * 3. 이미 해당 장소가 북마크 되어있다면 연결된 폴더 목록만 업데이트하고,<br>
     *    새로운 북마크라면 엔티티를 새로 생성하여 DB에 저장합니다.<br>
     * 4. 신규 북마크 생성 시 게임화(Gamification) 서비스에 활동 로그를 기록합니다.
     * </p>
     *
     * @param memberId 사용자 ID
     * @param placeId 북마크할 장소 ID
     * @param folderIds 장소를 저장할 폴더들의 ID 리스트
     * @return 최종 갱신되거나 추가된 북마크 응답 DTO
     */
    @Transactional
    public PlaceBookmarkResponse addBookmark(
        Long memberId,
        Long placeId,
        List<Long> folderIds
    ) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        PlaceMaster placeMaster = placeMasterRepository.findById(placeId)
            .orElseThrow(() -> new BusinessException(ErrorCode.PLACE_NOT_FOUND));

        List<BookmarkFolder> bookmarkFolders = new ArrayList<>();
        if (folderIds != null && !folderIds.isEmpty()) {
            for (Long folderId : folderIds) {
                BookmarkFolder folder = bookmarkFolderRepository.findByIdAndMemberId(folderId, memberId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.BOOKMARK_FOLDER_NOT_FOUND));
                bookmarkFolders.add(folder);
            }
        }

        PlaceBookmark placeBookmark = placeBookmarkRepository
            .findByMemberIdAndPlaceMasterId(memberId, placeId)
            .orElse(null);

        if (placeBookmark == null) {
            placeBookmark = PlaceBookmark.builder()
                .member(member)
                .placeMaster(placeMaster)
                .bookmarkFolders(bookmarkFolders)
                .build();
            placeBookmark = placeBookmarkRepository.saveAndFlush(placeBookmark);
            gamificationService.logActivity(memberId, ActivityType.BOOKMARK_ADD, "장소 '" + placeMaster.getBizesNm() + "' 저장");
        } else {
            placeBookmark.updateFolders(bookmarkFolders);
            placeBookmark = placeBookmarkRepository.saveAndFlush(placeBookmark);
        }

        return PlaceBookmarkResponse.from(placeBookmark);
    }

    /**
     * 장소에 대한 북마크를 해제(삭제)합니다.
     * <p>
     * 회원 ID와 장소 ID로 북마크 엔티티를 조회한 후 DB에서 삭제합니다.
     * </p>
     *
     * @param memberId 사용자 ID
     * @param placeId 삭제할 장소 ID
     * @throws BusinessException 해당 북마크가 존재하지 않을 경우 발생
     */
    @Transactional
    public void removeBookmark(
        Long memberId,
        Long placeId
    ) {
        PlaceBookmark placeBookmark = placeBookmarkRepository
            .findByMemberIdAndPlaceMasterId(memberId, placeId)
            .orElseThrow(() -> new BusinessException(ErrorCode.PLACE_BOOKMARK_NOT_FOUND));

        placeBookmarkRepository.delete(placeBookmark);
    }

    /**
     * 사용자의 모든 북마크 목록을 페이징하여 최신순으로 조회합니다.
     *
     * @param memberId 조회할 사용자 ID
     * @param pageable 페이징 및 정렬 정보
     * @return 페이징된 북마크 응답 DTO
     */
    public Page<PlaceBookmarkResponse> getMyBookmarks(
        Long memberId,
        Pageable pageable
    ) {
        return getMyBookmarks(memberId, null, pageable);
    }

    /**
     * 특정 폴더 내의 북마크 목록을 페이징하여 조회합니다.
     * <p>
     * folderId가 주어지면 해당 폴더에 속한 북마크만 필터링하며,
     * null인 경우 전체 북마크 목록을 최신순으로 조회합니다.
     * </p>
     *
     * @param memberId 사용자 ID
     * @param folderId 조회할 폴더 ID (null 가능)
     * @param pageable 페이징 정보
     * @return 필터링 및 페이징된 북마크 응답 DTO
     */
    public Page<PlaceBookmarkResponse> getMyBookmarks(
        Long memberId,
        Long folderId,
        Pageable pageable
    ) {
        if (folderId != null) {
            return placeBookmarkRepository.findByMemberIdAndFolderId(memberId, folderId, pageable)
                .map(PlaceBookmarkResponse::from);
        }
        return placeBookmarkRepository.findByMemberIdOrderByCreatedAtDesc(memberId, pageable)
            .map(PlaceBookmarkResponse::from);
    }

    /**
     * 특정 장소가 사용자의 북마크에 추가되어 있는지 여부를 확인합니다.
     *
     * @param memberId 사용자 ID
     * @param placeId 확인할 장소 ID
     * @return 북마크 추가 여부 (true/false)
     */
    public boolean isBookmarked(
        Long memberId,
        Long placeId
    ) {
        return placeBookmarkRepository.existsByMemberIdAndPlaceMasterId(memberId, placeId);
    }

    /**
     * 회원 ID와 장소 ID를 기반으로 북마크 엔티티를 직접 조회합니다.
     *
     * @param memberId 사용자 ID
     * @param placeId 장소 ID
     * @return 조회된 북마크 엔티티 (Optional)
     */
    public Optional<PlaceBookmark> getBookmark(
        Long memberId,
        Long placeId
    ) {
        return placeBookmarkRepository.findByMemberIdAndPlaceMasterId(memberId, placeId);
    }
}
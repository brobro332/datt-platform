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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceBookmarkService {
    private final PlaceBookmarkRepository placeBookmarkRepository;
    private final MemberRepository memberRepository;
    private final PlaceMasterRepository placeMasterRepository;
    private final BookmarkFolderRepository bookmarkFolderRepository;
    private final GamificationService gamificationService;

    @Transactional
    public PlaceBookmarkResponse addBookmark(
        Long memberId,
        Long placeId
    ) {
        return addBookmark(memberId, placeId, List.of());
    }

    @Transactional
    public PlaceBookmarkResponse addBookmark(
        Long memberId,
        Long placeId,
        Long folderId
    ) {
        return addBookmark(memberId, placeId, folderId != null ? List.of(folderId) : List.of());
    }

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

    public Page<PlaceBookmarkResponse> getMyBookmarks(
        Long memberId,
        Pageable pageable
    ) {
        return getMyBookmarks(memberId, null, pageable);
    }

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

    public boolean isBookmarked(
        Long memberId,
        Long placeId
    ) {
        return placeBookmarkRepository.existsByMemberIdAndPlaceMasterId(memberId, placeId);
    }

    public Optional<PlaceBookmark> getBookmark(
        Long memberId,
        Long placeId
    ) {
        return placeBookmarkRepository.findByMemberIdAndPlaceMasterId(memberId, placeId);
    }
}
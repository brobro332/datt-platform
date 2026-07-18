package xyz.datt.domain.bookmark.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.bookmark.dto.BookmarkFolderResponse;
import xyz.datt.domain.bookmark.dto.PlaceBookmarkResponse;
import xyz.datt.domain.bookmark.dto.PublicBookmarkFolderResponse;
import xyz.datt.domain.bookmark.entity.BookmarkFolder;
import xyz.datt.domain.bookmark.entity.PlaceBookmark;
import xyz.datt.domain.bookmark.repository.BookmarkFolderRepository;
import xyz.datt.domain.bookmark.repository.PlaceBookmarkRepository;
import xyz.datt.domain.member.entity.Member;
import xyz.datt.domain.member.repository.MemberRepository;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookmarkFolderService {
    private final BookmarkFolderRepository bookmarkFolderRepository;
    private final MemberRepository memberRepository;
    private final PlaceBookmarkRepository placeBookmarkRepository;

    @Transactional
    public BookmarkFolderResponse createFolder(Long memberId, String name) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (bookmarkFolderRepository.existsByMemberIdAndName(memberId, name)) {
            throw new BusinessException(ErrorCode.BOOKMARK_FOLDER_ALREADY_EXISTS);
        }

        BookmarkFolder folder = BookmarkFolder.builder()
            .member(member)
            .name(name)
            .build();

        BookmarkFolder savedFolder = bookmarkFolderRepository.save(folder);
        return BookmarkFolderResponse.from(savedFolder);
    }

    public List<BookmarkFolderResponse> getFolders(Long memberId) {
        return bookmarkFolderRepository.findByMemberIdOrderByNameAsc(memberId).stream()
            .map(BookmarkFolderResponse::from)
            .toList();
    }

    @Transactional
    public BookmarkFolderResponse updateFolder(Long memberId, Long folderId, String name) {
        BookmarkFolder folder = bookmarkFolderRepository.findByIdAndMemberId(folderId, memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.BOOKMARK_FOLDER_NOT_FOUND));

        if (!folder.getName().equals(name) && bookmarkFolderRepository.existsByMemberIdAndName(memberId, name)) {
            throw new BusinessException(ErrorCode.BOOKMARK_FOLDER_ALREADY_EXISTS);
        }

        folder.updateName(name);
        return BookmarkFolderResponse.from(folder);
    }

    @Transactional
    public void deleteFolder(Long memberId, Long folderId) {
        BookmarkFolder folder = bookmarkFolderRepository.findByIdAndMemberId(folderId, memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.BOOKMARK_FOLDER_NOT_FOUND));

        bookmarkFolderRepository.delete(folder);
    }

    public PublicBookmarkFolderResponse getPublicFolder(Long folderId) {
        BookmarkFolder folder = bookmarkFolderRepository.findById(folderId)
            .orElseThrow(() -> new BusinessException(ErrorCode.BOOKMARK_FOLDER_NOT_FOUND));

        List<PlaceBookmark> bookmarks = placeBookmarkRepository.findByFolderId(folderId);

        List<PlaceBookmarkResponse> bookmarkResponses = bookmarks.stream()
            .map(PlaceBookmarkResponse::from)
            .toList();

        return new PublicBookmarkFolderResponse(
            folder.getId(),
            folder.getName(),
            folder.getMember().getNickname(),
            bookmarkResponses
        );
    }
}

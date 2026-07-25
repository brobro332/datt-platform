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

/**
 * 북마크 폴더 관리(생성, 조회, 수정, 삭제) 비즈니스 로직을 처리하는 서비스입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookmarkFolderService {
    private final BookmarkFolderRepository bookmarkFolderRepository;
    private final MemberRepository memberRepository;
    private final PlaceBookmarkRepository placeBookmarkRepository;

    /**
     * 새로운 북마크 폴더를 생성합니다.
     * <p>
     * 1. 요청한 회원(memberId)이 유효한지 검증합니다.<br>
     * 2. 해당 회원의 폴더 중 동일한 이름이 있는지 중복 검사를 수행합니다.<br>
     * 3. 중복이 아니면 새로운 폴더 엔티티를 생성하여 DB에 저장합니다.
     * </p>
     *
     * @param memberId 폴더를 생성할 회원의 ID
     * @param name 생성할 폴더의 이름
     * @return 생성된 북마크 폴더 정보 DTO
     */
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

    /**
     * 특정 회원이 소유한 모든 북마크 폴더 목록을 조회합니다.
     * <p>
     * 폴더 이름(name)을 기준으로 오름차순 정렬하여 반환합니다.
     * </p>
     *
     * @param memberId 조회할 회원의 ID
     * @return 북마크 폴더 응답 DTO 리스트
     */
    public List<BookmarkFolderResponse> getFolders(Long memberId) {
        return bookmarkFolderRepository.findByMemberIdOrderByNameAsc(memberId).stream()
            .map(BookmarkFolderResponse::from)
            .toList();
    }

    /**
     * 북마크 폴더의 이름을 수정합니다.
     * <p>
     * 1. 폴더 ID와 회원 ID로 본인 소유의 폴더가 맞는지 확인합니다.<br>
     * 2. 기존 이름과 다를 경우, 변경하려는 이름이 이미 존재하는지 중복 검사를 수행합니다.<br>
     * 3. 문제가 없으면 엔티티의 이름을 변경하고 더티 체킹을 통해 업데이트합니다.
     * </p>
     *
     * @param memberId 수정을 요청한 회원 ID
     * @param folderId 수정할 폴더 ID
     * @param name 새롭게 지정할 폴더 이름
     * @return 수정이 완료된 북마크 폴더 정보 DTO
     */
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

    /**
     * 북마크 폴더를 삭제합니다.
     * <p>
     * 폴더 소유권을 검증한 후, 해당 폴더 엔티티를 DB에서 삭제 처리합니다.
     * (해당 폴더와 연결된 북마크 관계 처리 로직은 설정된 cascade 옵션 등에 의존합니다.)
     * </p>
     *
     * @param memberId 삭제를 요청한 회원 ID
     * @param folderId 삭제할 폴더 ID
     */
    @Transactional
    public void deleteFolder(Long memberId, Long folderId) {
        BookmarkFolder folder = bookmarkFolderRepository.findByIdAndMemberId(folderId, memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.BOOKMARK_FOLDER_NOT_FOUND));

        bookmarkFolderRepository.delete(folder);
    }

    /**
     * 특정 폴더의 공개 정보와 내부 북마크 목록을 조회합니다.
     * <p>
     * 공유 목적으로 타인이 열람할 수 있도록 폴더 내에 저장된 장소 북마크 정보를
     * 함께 조회하여 반환합니다.
     * </p>
     *
     * @param folderId 조회할 폴더 ID
     * @return 폴더 정보와 포함된 북마크 장소 목록이 담긴 공개 DTO
     */
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

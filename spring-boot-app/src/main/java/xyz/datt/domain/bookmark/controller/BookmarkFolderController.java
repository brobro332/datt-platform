package xyz.datt.domain.bookmark.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import xyz.datt.domain.bookmark.dto.BookmarkFolderRequest;
import xyz.datt.domain.bookmark.dto.BookmarkFolderResponse;
import xyz.datt.domain.bookmark.dto.PublicBookmarkFolderResponse;
import xyz.datt.domain.bookmark.service.BookmarkFolderService;
import xyz.datt.global.response.ApiResponse;
import xyz.datt.global.security.CustomUserDetails;

import java.util.List;

/**
 * 사용자의 장소 북마크를 관리할 수 있는 '폴더(Folder)' 관련 API 요청을 처리하는 컨트롤러입니다.
 * 북마크 폴더의 생성, 조회, 수정, 삭제 및 특정 폴더의 공개 정보를 제공합니다.
 */
@RestController
@RequestMapping("/api/bookmarks/folders")
@RequiredArgsConstructor
public class BookmarkFolderController {
    private final BookmarkFolderService bookmarkFolderService;

    /**
     * 로그인한 사용자를 위한 새로운 북마크 폴더를 생성합니다.
     * BookmarkFolderService를 호출하여 데이터베이스에 폴더 정보를 저장합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param request 새 폴더의 이름 등 요청 정보
     * @return 생성된 북마크 폴더 정보
     */
    @PostMapping
    public ApiResponse<BookmarkFolderResponse> createFolder(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @Valid @RequestBody BookmarkFolderRequest request
    ) {
        BookmarkFolderResponse response = bookmarkFolderService.createFolder(
            userDetails.getMemberId(),
            request.name()
        );
        return ApiResponse.success(response);
    }

    /**
     * 로그인한 사용자가 소유한 전체 북마크 폴더 목록을 조회합니다.
     * 각 폴더 내에 포함된 북마크 수 등의 정보가 함께 반환될 수 있습니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @return 사용자의 북마크 폴더 목록
     */
    @GetMapping
    public ApiResponse<List<BookmarkFolderResponse>> getFolders(
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<BookmarkFolderResponse> response = bookmarkFolderService.getFolders(
            userDetails.getMemberId()
        );
        return ApiResponse.success(response);
    }

    /**
     * 사용자가 소유한 특정 북마크 폴더의 이름 등을 수정합니다.
     * 권한 확인 후 BookmarkFolderService를 통해 변경사항을 데이터베이스에 반영합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param folderId 수정할 대상 폴더의 ID
     * @param request 수정할 폴더의 새로운 정보(이름 등)
     * @return 수정 완료된 북마크 폴더 정보
     */
    @PutMapping("/{folderId}")
    public ApiResponse<BookmarkFolderResponse> updateFolder(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long folderId,
        @Valid @RequestBody BookmarkFolderRequest request
    ) {
        BookmarkFolderResponse response = bookmarkFolderService.updateFolder(
            userDetails.getMemberId(),
            folderId,
            request.name()
        );
        return ApiResponse.success(response);
    }

    /**
     * 특정 북마크 폴더를 삭제합니다.
     * 폴더 내에 저장된 북마크 데이터들에 대한 연관 처리는 BookmarkFolderService에서 담당합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param folderId 삭제할 북마크 폴더 ID
     * @return 빈 성공 응답
     */
    @DeleteMapping("/{folderId}")
    public ApiResponse<Void> deleteFolder(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long folderId
    ) {
        bookmarkFolderService.deleteFolder(userDetails.getMemberId(), folderId);
        return ApiResponse.success(null);
    }

    /**
     * 외부에서 접근 가능하도록 공개된(Public) 특정 북마크 폴더의 정보를 조회합니다.
     * 로그인 여부와 관계없이 접근 가능할 수 있습니다.
     *
     * @param folderId 조회할 공개 북마크 폴더 ID
     * @return 공개 북마크 폴더 정보
     */
    @GetMapping("/{folderId}/public")
    public ApiResponse<PublicBookmarkFolderResponse> getPublicFolder(
        @PathVariable Long folderId
    ) {
        PublicBookmarkFolderResponse response = bookmarkFolderService.getPublicFolder(folderId);
        return ApiResponse.success(response);
    }
}

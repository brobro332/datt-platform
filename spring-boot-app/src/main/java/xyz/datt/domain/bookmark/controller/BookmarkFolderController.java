package xyz.datt.domain.bookmark.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import xyz.datt.domain.bookmark.dto.BookmarkFolderRequest;
import xyz.datt.domain.bookmark.dto.BookmarkFolderResponse;
import xyz.datt.domain.bookmark.service.BookmarkFolderService;
import xyz.datt.global.response.ApiResponse;
import xyz.datt.global.security.CustomUserDetails;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks/folders")
@RequiredArgsConstructor
public class BookmarkFolderController {
    private final BookmarkFolderService bookmarkFolderService;

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

    @GetMapping
    public ApiResponse<List<BookmarkFolderResponse>> getFolders(
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<BookmarkFolderResponse> response = bookmarkFolderService.getFolders(
            userDetails.getMemberId()
        );
        return ApiResponse.success(response);
    }

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

    @DeleteMapping("/{folderId}")
    public ApiResponse<Void> deleteFolder(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long folderId
    ) {
        bookmarkFolderService.deleteFolder(userDetails.getMemberId(), folderId);
        return ApiResponse.success(null);
    }
}

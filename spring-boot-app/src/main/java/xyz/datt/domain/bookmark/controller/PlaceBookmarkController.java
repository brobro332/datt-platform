package xyz.datt.domain.bookmark.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import xyz.datt.domain.bookmark.dto.BookmarkPlaceRequest;
import xyz.datt.domain.bookmark.dto.PlaceBookmarkResponse;
import xyz.datt.domain.bookmark.service.PlaceBookmarkService;
import xyz.datt.global.response.ApiResponse;
import xyz.datt.global.security.CustomUserDetails;

/**
 * 장소(Place)에 대한 북마크(저장) 처리 관련 API 요청을 담당하는 컨트롤러입니다.
 * 사용자가 장소를 특정 북마크 폴더에 추가하거나 제거, 그리고 자신의 북마크 목록을 조회할 수 있도록 합니다.
 */
@RestController
@RequiredArgsConstructor
public class PlaceBookmarkController {
    private final PlaceBookmarkService placeBookmarkService;

    /**
     * 특정 장소를 사용자의 북마크 폴더에 추가합니다.
     * PlaceBookmarkService를 호출하여 지정된 폴더(들) 내부에 해당 장소를 북마크 항목으로 등록합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param placeId 북마크할 장소 ID
     * @param request 저장할 폴더 ID 목록을 담은 요청 객체
     * @return 등록된 장소 북마크 정보
     */
    @PostMapping("/api/bookmarks/places/{placeId}")
    public ApiResponse<PlaceBookmarkResponse> addPlaceBookmark(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long placeId,
        @RequestBody BookmarkPlaceRequest request
    ) {
        PlaceBookmarkResponse response = placeBookmarkService.addBookmark(
            userDetails.getMemberId(),
            placeId,
            request.folderIds()
        );

        return ApiResponse.success(response);
    }

    /**
     * 특정 장소의 북마크를 해제합니다.
     * 해당 사용자가 저장해 둔 장소 북마크 데이터(모든 폴더 포함)를 삭제 처리합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param placeId 북마크를 해제할 장소 ID
     * @return 빈 성공 응답
     */
    @DeleteMapping("/api/bookmarks/places/{placeId}")
    public ApiResponse<Void> removePlaceBookmark(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long placeId
    ) {
        placeBookmarkService.removeBookmark(userDetails.getMemberId(), placeId);

        return ApiResponse.success(null);
    }

    /**
     * 사용자가 저장한 북마크 장소 목록을 페이징하여 조회합니다.
     * 특정 폴더 ID가 주어지면 해당 폴더 내의 장소만 필터링하여 반환하고, 없으면 전체 북마크 장소를 반환합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param folderId 필터링할 폴더 ID (선택)
     * @param pageable 페이징 정보
     * @return 페이징된 북마크 장소 목록
     */
    @GetMapping("/api/bookmarks/places")
    public ApiResponse<Page<PlaceBookmarkResponse>> getMyPlaceBookmarks(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @RequestParam(value = "folderId", required = false) Long folderId,
        Pageable pageable
    ) {
        Page<PlaceBookmarkResponse> response = placeBookmarkService.getMyBookmarks(
            userDetails.getMemberId(),
            folderId,
            pageable
        );

        return ApiResponse.success(response);
    }
}
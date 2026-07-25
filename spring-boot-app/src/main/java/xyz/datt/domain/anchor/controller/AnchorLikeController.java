package xyz.datt.domain.anchor.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import xyz.datt.domain.anchor.service.AnchorLikeService;
import xyz.datt.global.response.ApiResponse;
import xyz.datt.global.security.CustomUserDetails;

/**
 * 앵커(Anchor)에 대한 좋아요(Like) 처리와 관련된 API 요청을 처리하는 컨트롤러입니다.
 * 사용자가 앵커에 좋아요를 누르거나 취소하는 기능을 제공합니다.
 */
@RestController
@RequiredArgsConstructor
public class AnchorLikeController {
    private final AnchorLikeService anchorLikeService;

    /**
     * 특정 앵커에 좋아요를 추가합니다.
     * 중복 처리 등은 AnchorLikeService 내에서 검증하여 반영합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param anchorId 좋아요를 추가할 대상 앵커 ID
     * @return 빈 성공 응답
     */
    @PostMapping("/api/anchors/{anchorId}/likes")
    public ApiResponse<Void> likeAnchor(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long anchorId
    ) {
        anchorLikeService.likeAnchor(userDetails.getMemberId(), anchorId);

        return ApiResponse.success(null);
    }

    /**
     * 특정 앵커에 등록된 좋아요를 취소합니다.
     * AnchorLikeService를 통해 데이터베이스에서 좋아요 정보를 삭제합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param anchorId 좋아요를 취소할 대상 앵커 ID
     * @return 빈 성공 응답
     */
    @DeleteMapping("/api/anchors/{anchorId}/likes")
    public ApiResponse<Void> unlikeAnchor(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long anchorId
    ) {
        anchorLikeService.unlikeAnchor(userDetails.getMemberId(), anchorId);

        return ApiResponse.success(null);
    }
}
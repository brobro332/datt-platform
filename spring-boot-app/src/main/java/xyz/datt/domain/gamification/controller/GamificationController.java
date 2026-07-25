package xyz.datt.domain.gamification.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import xyz.datt.domain.gamification.dto.MemberAchievementResponse;
import xyz.datt.domain.gamification.dto.MemberActivityLogResponse;
import xyz.datt.domain.gamification.dto.MemberTitleResponse;
import xyz.datt.domain.gamification.service.GamificationService;
import xyz.datt.global.response.ApiResponse;
import xyz.datt.global.security.CustomUserDetails;

import java.util.List;

/**
 * 게이미피케이션(사용자 활동 로그, 칭호, 업적 등) 관련 기능을 제공하는 컨트롤러입니다.
 * 사용자의 활동 내역 조회, 보유한 칭호 및 업적 조회, 그리고 대표 칭호 변경 요청을 받아
 * GamificationService를 통해 비즈니스 로직을 처리한 뒤 결과를 반환합니다.
 */
@RestController
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;

    /**
     * 로그인한 사용자의 활동 로그(Activity Log) 내역을 페이징 처리하여 조회합니다.
     *
     * [Call Graph]
     * 1. Security Context에서 CustomUserDetails를 가져와 현재 사용자의 memberId 추출.
     * 2. GamificationService.getMyActivityLogs(memberId, pageable) 호출하여 사용자의 활동 로그를 DB에서 조회.
     * 3. 페이징된 활동 로그 응답 객체(Page<MemberActivityLogResponse>)를 반환.
     *
     * @param userDetails 현재 로그인한 사용자의 인증 정보
     * @param pageable 페이징 요청 정보
     * @return 사용자의 활동 로그 페이지 결과
     */
    @GetMapping("/api/my/activity-logs")
    public ApiResponse<Page<MemberActivityLogResponse>> getMyActivityLogs(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        Pageable pageable
    ) {
        Page<MemberActivityLogResponse> response = gamificationService.getMyActivityLogs(
            userDetails.getMemberId(),
            pageable
        );
        return ApiResponse.success(response);
    }

    /**
     * 로그인한 사용자가 현재까지 획득한 칭호(Title) 목록을 조회합니다.
     *
     * [Call Graph]
     * 1. Security Context에서 로그인한 사용자의 memberId 추출.
     * 2. GamificationService.getMyTitles(memberId) 호출하여 회원이 보유한 칭호 목록(MemberTitleResponse 리스트)을 조회.
     * 3. 칭호 목록 결과를 응답.
     *
     * @param userDetails 현재 로그인한 사용자의 인증 정보
     * @return 사용자가 획득한 칭호 목록
     */
    @GetMapping("/api/my/titles")
    public ApiResponse<List<MemberTitleResponse>> getMyTitles(
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<MemberTitleResponse> response = gamificationService.getMyTitles(
            userDetails.getMemberId()
        );
        return ApiResponse.success(response);
    }

    /**
     * 로그인한 사용자가 달성한 업적(Achievement) 목록을 조회합니다.
     *
     * [Call Graph]
     * 1. Security Context에서 로그인한 사용자의 memberId 추출.
     * 2. GamificationService.getMyAchievements(memberId) 호출하여 회원이 달성한 업적 목록 조회.
     * 3. 업적 목록(MemberAchievementResponse 리스트) 결과를 반환.
     *
     * @param userDetails 현재 로그인한 사용자의 인증 정보
     * @return 사용자가 달성한 업적 목록
     */
    @GetMapping("/api/my/achievements")
    public ApiResponse<List<MemberAchievementResponse>> getMyAchievements(
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<MemberAchievementResponse> response = gamificationService.getMyAchievements(
            userDetails.getMemberId()
        );
        return ApiResponse.success(response);
    }

    /**
     * 사용자가 보유한 특정 칭호를 본인의 대표 칭호로 설정합니다.
     *
     * [Call Graph]
     * 1. Security Context에서 로그인한 사용자의 memberId 추출.
     * 2. PathVariable로 변경할 대상 칭호 ID(titleId) 획득.
     * 3. GamificationService.selectMyTitle(memberId, titleId)를 호출하여 DB 상의 대표 칭호 상태 변경.
     * 4. 변경된 칭호 정보를 반환.
     *
     * @param userDetails 현재 로그인한 사용자의 인증 정보
     * @param titleId 대표 칭호로 설정할 칭호의 ID
     * @return 대표 칭호 설정 완료 후의 해당 칭호 정보
     */
    @PatchMapping("/api/my/titles/{titleId}/select")
    public ApiResponse<MemberTitleResponse> selectMyTitle(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long titleId
    ) {
        MemberTitleResponse response = gamificationService.selectMyTitle(
            userDetails.getMemberId(),
            titleId
        );
        return ApiResponse.success(response);
    }
}

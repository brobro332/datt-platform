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

@RestController
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;

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

    @GetMapping("/api/my/titles")
    public ApiResponse<List<MemberTitleResponse>> getMyTitles(
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<MemberTitleResponse> response = gamificationService.getMyTitles(
            userDetails.getMemberId()
        );
        return ApiResponse.success(response);
    }

    @GetMapping("/api/my/achievements")
    public ApiResponse<List<MemberAchievementResponse>> getMyAchievements(
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<MemberAchievementResponse> response = gamificationService.getMyAchievements(
            userDetails.getMemberId()
        );
        return ApiResponse.success(response);
    }

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

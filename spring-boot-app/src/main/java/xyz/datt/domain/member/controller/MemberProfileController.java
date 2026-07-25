package xyz.datt.domain.member.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.member.dto.MemberProfileResponse;
import xyz.datt.domain.member.dto.UpdateNicknameRequest;
import xyz.datt.domain.member.service.MemberProfileService;
import xyz.datt.global.response.ApiResponse;
import xyz.datt.global.security.CustomUserDetails;

/**
 * 회원의 개인 프로필과 관련된 요청을 처리하는 컨트롤러입니다.
 * 내 프로필 조회, 닉네임 변경, 회원 탈퇴 등의 요청을 받아 MemberProfileService로 전달합니다.
 */
@RestController
@RequiredArgsConstructor
public class MemberProfileController {
    private final MemberProfileService memberProfileService;

    /**
     * 로그인한 사용자의 프로필 정보를 조회합니다.
     *
     * [Call Graph]
     * 1. Security Context에 저장된 인증 정보로부터 사용자 ID 획득.
     * 2. MemberProfileService.getMyProfile(memberId) 호출하여 회원 정보(엔티티)를 가져옴.
     * 3. DTO(MemberProfileResponse)로 변환된 결과를 클라이언트에 반환.
     *
     * @param userDetails 현재 로그인한 사용자의 인증 정보
     * @return 회원의 기본 정보 및 프로필 내역
     */
    @GetMapping("/api/my/profile")
    public ApiResponse<MemberProfileResponse> getMyProfile(
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        MemberProfileResponse response = memberProfileService.getMyProfile(
            userDetails.getMemberId()
        );

        return ApiResponse.success(response);
    }

    /**
     * 로그인한 사용자의 닉네임을 변경합니다.
     *
     * [Call Graph]
     * 1. 변경할 닉네임이 담긴 UpdateNicknameRequest 검증(@Valid).
     * 2. MemberProfileService.updateNickname(memberId, nickname)을 호출하여 중복 확인 및 DB 엔티티 업데이트 수행.
     * 3. 닉네임 변경 후의 프로필 정보를 응답.
     *
     * @param userDetails 현재 로그인한 사용자의 인증 정보
     * @param request 변경할 닉네임이 포함된 요청 DTO
     * @return 닉네임이 변경된 이후의 프로필 정보
     */
    @PutMapping("/api/my/profile/nickname")
    public ApiResponse<MemberProfileResponse> updateNickname(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @Valid @RequestBody UpdateNicknameRequest request
    ) {
        MemberProfileResponse response = memberProfileService.updateNickname(
            userDetails.getMemberId(),
            request.nickname()
        );

        return ApiResponse.success(response);
    }

    /**
     * 현재 로그인한 사용자의 회원 탈퇴 처리를 수행합니다.
     *
     * [Call Graph]
     * 1. Security Context로부터 사용자 ID 획득.
     * 2. MemberProfileService.withdraw(memberId)를 호출하여 탈퇴 처리 진행.
     *    (주로 논리적 삭제(상태 변경) 또는 물리적 삭제, 연결된 데이터 정리 등이 수행됨)
     * 3. 빈 응답 결과와 함께 200 OK 상태 코드 반환.
     *
     * @param userDetails 현재 로그인한 사용자의 인증 정보
     * @return 처리 완료 응답 (데이터 없음)
     */
    @DeleteMapping("/api/my/profile")
    public ApiResponse<Void> withdraw(
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        memberProfileService.withdraw(userDetails.getMemberId());
        return ApiResponse.success(null);
    }
}
package xyz.datt.domain.member.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.member.dto.MemberAdminResponse;
import xyz.datt.domain.member.service.MemberAdminService;
import xyz.datt.global.response.ApiResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/members")
public class MemberAdminController {

    private final MemberAdminService memberAdminService;

    @GetMapping
    public ApiResponse<Page<MemberAdminResponse>> getAllMembers(
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<MemberAdminResponse> response = memberAdminService.getAllMembers(pageable);
        return ApiResponse.success(response);
    }
}

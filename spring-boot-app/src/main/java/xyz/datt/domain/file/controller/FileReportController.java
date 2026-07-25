package xyz.datt.domain.file.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.file.service.FileReportService;
import xyz.datt.global.response.ApiResponse;

import java.util.Map;

/**
 * 파일 또는 이미지와 관련된 시스템 상태 및 오류 신고 요청을 처리하는 컨트롤러입니다.
 * 예를 들어 프론트엔드에서 이미지를 불러올 수 없는(깨진 이미지) 상황 발생 시 사용됩니다.
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileReportController {

    private final FileReportService fileReportService;

    /**
     * 로드되지 않거나 깨진 이미지(Broken Image)의 URL을 신고받아 처리합니다.
     * FileReportService를 호출하여 실제로 해당 URL의 리소스 접근이 불가능한지 검증하고, 문제가 확인되면 조치(예: DB 삭제 등)를 수행합니다.
     *
     * @param request "imageUrl" 키를 포함하는 깨진 이미지 정보 맵
     * @return 빈 성공 응답
     */
    @PostMapping("/report-broken")
    public ApiResponse<Void> reportBrokenImage(@RequestBody Map<String, String> request) {
        String imageUrl = request.get("imageUrl");
        fileReportService.verifyAndRemoveBrokenImage(imageUrl);
        return ApiResponse.success(null);
    }
}

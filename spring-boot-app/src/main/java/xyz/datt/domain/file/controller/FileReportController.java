package xyz.datt.domain.file.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.file.service.FileReportService;
import xyz.datt.global.response.ApiResponse;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileReportController {

    private final FileReportService fileReportService;

    @PostMapping("/report-broken")
    public ApiResponse<Void> reportBrokenImage(@RequestBody Map<String, String> request) {
        String imageUrl = request.get("imageUrl");
        fileReportService.verifyAndRemoveBrokenImage(imageUrl);
        return ApiResponse.success(null);
    }
}

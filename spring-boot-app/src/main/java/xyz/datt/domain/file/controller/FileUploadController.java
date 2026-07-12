package xyz.datt.domain.file.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import xyz.datt.global.infrastructure.storage.FileStorageService;
import xyz.datt.global.response.ApiResponse;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ApiResponse<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "dir", defaultValue = "general") String directory
    ) {
        String fileUrl = fileStorageService.uploadFile(file, directory);
        return ApiResponse.success(fileUrl);
    }
}

package xyz.datt.domain.file.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import xyz.datt.global.infrastructure.storage.FileStorageService;
import xyz.datt.global.response.ApiResponse;

/**
 * 파일 업로드를 처리하는 컨트롤러입니다.
 * 클라이언트로부터 전달받은 MultipartFile 객체를 FileStorageService를 통해 실제 저장소(예: S3, 로컬 파일 시스템 등)에 업로드하고,
 * 업로드된 파일의 접근 URL을 반환하는 역할을 수행합니다.
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    /**
     * 단일 파일 업로드를 처리합니다.
     * 
     * [Call Graph]
     * 1. 클라이언트가 MultipartFile과 선택적 파라미터 dir(디렉토리명)을 POST 요청으로 전송.
     * 2. fileStorageService.uploadFile(file, directory)를 호출하여 파일을 지정된 경로에 업로드.
     * 3. 업로드가 완료되면 반환된 파일 URL을 ApiResponse에 담아 클라이언트에 응답.
     *
     * @param file 클라이언트로부터 업로드된 파일 데이터
     * @param directory 파일이 저장될 대상 디렉토리 (기본값: "general")
     * @return 업로드된 파일의 URL이 담긴 API 응답
     */
    @PostMapping("/upload")
    public ApiResponse<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "dir", defaultValue = "general") String directory
    ) {
        String fileUrl = fileStorageService.uploadFile(file, directory);
        return ApiResponse.success(fileUrl);
    }
}

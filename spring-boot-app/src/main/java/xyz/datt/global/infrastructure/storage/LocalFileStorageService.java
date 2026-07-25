package xyz.datt.global.infrastructure.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * 로컬 서버의 파일 시스템을 사용하여 파일을 저장하고 관리하는 파일 스토리지 구현체입니다.
 * 'storage.type=local' 프로퍼티 조건일 때 혹은 기본값으로 활성화됩니다.
 * 주로 개발 환경이나 단일 서버 구성에서 활용됩니다.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements FileStorageService {

    @Value("${storage.local.upload-dir:uploads}")
    private String uploadDir;

    @Value("${storage.local.server-url:http://localhost:8080}")
    private String serverUrl;

    /**
     * Multipart 파일을 로컬 디렉토리에 저장하고, 웹에서 접근 가능한 URL 경로를 반환합니다.
     * 파일명은 UUID 기반으로 생성되어 이름 충돌을 방지합니다.
     *
     * @param file 업로드할 MultipartFile 객체
     * @param directory 저장될 하위 디렉토리명 (예: 'reviews', 'profiles')
     * @return 서버 접근 URL을 포함한 최종 파일 URL
     * @throws BusinessException 파일이 비어있거나 저장 중 입출력 예외가 발생한 경우 예외 발생
     */
    @Override
    public String uploadFile(MultipartFile file, String directory) {
        if (file.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        File folder = new File(uploadDir, directory).getAbsoluteFile();
        if (!folder.exists()) {
            folder.mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String savedFilename = UUID.randomUUID().toString() + extension;

        File destination = new File(folder, savedFilename);
        try {
            file.transferTo(destination);
            return serverUrl + "/uploads/" + directory + "/" + savedFilename;
        } catch (IOException e) {
            log.error("Local file upload failed", e);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 인자로 전달받은 파일 URL 경로를 기반으로 로컬 파일 시스템에서 파일을 삭제합니다.
     * URL에 특정 구분자('/uploads/')가 포함되어 있는지 검증하여 안전하게 로컬 상대 경로를 유추합니다.
     *
     * @param fileUrl 삭제할 대상의 공개 접근 가능한 URL
     */
    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains("/uploads/")) {
            return;
        }
        String relativePath = fileUrl.substring(fileUrl.indexOf("/uploads/") + 9);
        File file = new File(uploadDir, relativePath);
        if (file.exists()) {
            file.delete();
        }
    }
}

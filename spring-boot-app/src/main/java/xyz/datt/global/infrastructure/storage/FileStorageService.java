package xyz.datt.global.infrastructure.storage;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    /**
     * 파일을 저장소에 업로드하고 접근 가능한 공개 URL을 반환합니다.
     *
     * @param file      업로드할 파일
     * @param directory 업로드 폴더명 (예: reviews, profiles 등)
     * @return 업로드된 파일의 공개 접근 URL
     */
    String uploadFile(MultipartFile file, String directory);

    /**
     * 저장소에서 파일을 삭제합니다.
     *
     * @param fileUrl 삭제할 파일의 공개 URL
     */
    void deleteFile(String fileUrl);
}

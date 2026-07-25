package xyz.datt.global.infrastructure.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * 파일 스토리지 작업을 추상화한 인터페이스입니다.
 * 로컬 파일 시스템, 클라우드 스토리지(OCI, AWS S3 등) 등 구현체에 따라 
 * 파일을 업로드하고 삭제하는 공통 규격을 정의합니다.
 */
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

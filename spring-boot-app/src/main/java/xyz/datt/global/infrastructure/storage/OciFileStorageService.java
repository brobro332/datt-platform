package xyz.datt.global.infrastructure.storage;

import com.oracle.bmc.ConfigFileReader;
import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider;
import com.oracle.bmc.objectstorage.ObjectStorageClient;
import com.oracle.bmc.objectstorage.requests.DeleteObjectRequest;
import com.oracle.bmc.objectstorage.requests.PutObjectRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

/**
 * Oracle Cloud Infrastructure(OCI) Object Storage를 사용하여 
 * 클라우드 스토리지 환경에 파일을 업로드하고 삭제하는 구현체입니다.
 * 'storage.type=oci' 프로퍼티 조건일 때 활성화되며, OCI SDK를 통해 스토리지와 통신합니다.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "oci")
public class OciFileStorageService implements FileStorageService {

    @Value("${storage.oci.config-path:~/.oci/config}")
    private String configFilePath;

    @Value("${storage.oci.profile:DEFAULT}")
    private String profile;

    @Value("${storage.oci.bucket-name}")
    private String bucketName;

    @Value("${storage.oci.namespace}")
    private String namespaceName;

    @Value("${storage.oci.region}")
    private String region;

    @Value("${storage.oci.prefix:local}")
    private String prefix;

    private ObjectStorageClient client;

    /**
     * 빈(Bean) 초기화 직후(@PostConstruct) OCI Object Storage 클라이언트를 세팅합니다.
     * 설정 파일 경로와 프로파일(Profile)을 통해 OCI 인증 정보(ConfigFileReader)를 읽어옵니다.
     * 초기화 실패 시 런타임 예외를 발생시켜 애플리케이션 시작을 중단시킵니다.
     */
    @PostConstruct
    public void init() {
        log.info("Initializing OCI Object Storage Client. Config path: [{}], Profile: [{}]", configFilePath, profile);
        try {
            ConfigFileReader.ConfigFile configFile = ConfigFileReader.parse(configFilePath, profile);
            ConfigFileAuthenticationDetailsProvider provider = new ConfigFileAuthenticationDetailsProvider(configFile);
            this.client = ObjectStorageClient.builder().build(provider);
            log.info("OCI Object Storage Client initialized successfully.");
        } catch (Exception e) {
            log.error("Failed to initialize OCI Object Storage client. Check config path, file existence, and profile.", e);
            throw new RuntimeException("OCI initialization failed: " + e.getMessage(), e);
        }
    }

    /**
     * Multipart 파일을 OCI Object Storage 버킷에 업로드합니다.
     * 파일명은 UUID로 난수화되어 고유 식별자를 가지며, 지정된 Prefix와 디렉토리 경로에 배치됩니다.
     * OCI Object Storage REST API의 직접 접근 URL(Public/Pre-Authenticated) 패턴을 반환합니다.
     *
     * @param file 업로드할 MultipartFile 객체
     * @param directory 논리적 폴더 구조 (예: 'reviews')
     * @return OCI Object Storage의 직접 다운로드/접근 URL
     * @throws BusinessException 파일이 유효하지 않거나 OCI 통신 중 예외가 발생한 경우 발생
     */
    @Override
    public String uploadFile(MultipartFile file, String directory) {
        if (file.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";

        String objectPath = (prefix != null && !prefix.trim().isEmpty())
                ? prefix.trim() + "/" + directory
                : directory;
        String objectName = objectPath + "/" + UUID.randomUUID().toString() + extension;

        try (InputStream inputStream = file.getInputStream()) {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucketName(bucketName)
                    .namespaceName(namespaceName)
                    .objectName(objectName)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .putObjectBody(inputStream)
                    .build();

            client.putObject(request);
            
            return String.format("https://objectstorage.%s.oraclecloud.com/n/%s/b/%s/o/%s",
                    region, namespaceName, bucketName, objectName);
        } catch (IOException e) {
            log.error("OCI file upload failed", e);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * OCI Object Storage 버킷에 저장된 단일 객체(Object)를 영구 삭제합니다.
     * 넘겨받은 fileUrl에서 '/o/' 이후의 부분을 파싱하여 실제 objectName을 추출합니다.
     *
     * @param fileUrl 업로드 시 반환된 OCI Object Storage의 전체 URL 경로
     */
    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null) return;
        String searchStr = "/o/";
        int idx = fileUrl.indexOf(searchStr);
        if (idx == -1) return;

        String objectName = fileUrl.substring(idx + searchStr.length());

        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucketName(bucketName)
                .namespaceName(namespaceName)
                .objectName(objectName)
                .build();

        client.deleteObject(request);
    }
}

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

    private ObjectStorageClient client;

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

    @Override
    public String uploadFile(MultipartFile file, String directory) {
        if (file.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String objectName = directory + "/" + UUID.randomUUID().toString() + extension;

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

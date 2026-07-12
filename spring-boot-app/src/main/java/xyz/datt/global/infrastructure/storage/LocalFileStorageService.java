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

@Slf4j
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements FileStorageService {

    @Value("${storage.local.upload-dir:uploads}")
    private String uploadDir;

    @Value("${storage.local.server-url:http://localhost:8080}")
    private String serverUrl;

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

package xyz.datt.domain.place.batch.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.job.parameters.JobParametersBuilder;
import org.springframework.batch.core.launch.JobOperator;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.BufferedOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlaceBatchService {
    private final JobOperator jobOperator;
    private final Job placeSyncJob;

    @Async
    public void runBatch() {
        try {
            // 1. 상가정보 데이터 파일 다운로드 및 압축 해제 자동화
            downloadAndUnzipIfNeeded();

            // 새롭게 바뀐 패키지의 JobParametersBuilder 사용
            JobParameters jobParameters = new JobParametersBuilder()
                    .addLong("timestamp", System.currentTimeMillis())
                    .toJobParameters();

            JobExecution execution = jobOperator.start(placeSyncJob, jobParameters);

            log.info("배치 실행 시작! Job 이름: {}, Status: {}", placeSyncJob.getName(), execution.getStatus());

        } catch (org.springframework.batch.core.launch.JobInstanceAlreadyCompleteException |
                 org.springframework.batch.core.launch.JobExecutionAlreadyRunningException |
                 org.springframework.batch.core.job.parameters.InvalidJobParametersException |
                 org.springframework.batch.core.launch.JobRestartException e) {

            // 시그니처에 명시된 배치 전용 예외들을 처리
            log.error("배치 상태/파라미터 관련 예외 발생", e);
        } catch (Exception e) {
            log.error("알 수 없는 배치 실행 오류", e);
        }
    }

    private void downloadAndUnzipIfNeeded() {
        Path uploadsDir = Paths.get("uploads");
        if (hasDataFiles(uploadsDir)) {
            log.info("[Batch Service] uploads 폴더에 기존 상가 정보 CSV 파일이 존재하므로 다운로드를 생략합니다.");
            return;
        }

        log.info("[Batch Service] uploads 폴더에 상가 정보 CSV 파일이 존재하지 않아 다운로드를 시작합니다...");
        try {
            Files.createDirectories(uploadsDir);

            // 1. data.go.kr 상세 페이지에서 contentUrl 파싱
            HttpClient client = HttpClient.newBuilder()
                    .followRedirects(HttpClient.Redirect.ALWAYS)
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://www.data.go.kr/data/15083033/fileData.do"))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String html = response.body();

            Pattern pattern = Pattern.compile("\"contentUrl\"\\s*:\\s*\"(https://www.data.go.kr/cmm/cmm/fileDownload.do[^\"]+)\"");
            Matcher matcher = pattern.matcher(html);
            if (!matcher.find()) {
                throw new IllegalStateException("공공데이터포털 상세 페이지에서 contentUrl(다운로드 링크)을 찾을 수 없습니다.");
            }

            String downloadUrl = matcher.group(1).replace("\\/", "/");
            log.info("[Batch Service] 최신 다운로드 URL 획득: {}", downloadUrl);

            // 2. ZIP 파일 스트리밍 다운로드 (OOM 방지)
            Path tempZip = uploadsDir.resolve("store_info.zip");
            log.info("[Batch Service] ZIP 파일 다운로드 중... (약 320MB)");

            HttpRequest downloadRequest = HttpRequest.newBuilder()
                    .uri(URI.create(downloadUrl))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .GET()
                    .build();

            client.send(downloadRequest, HttpResponse.BodyHandlers.ofFile(tempZip));
            log.info("[Batch Service] ZIP 파일 다운로드 완료: {}", tempZip);

            // 3. 압축 해제
            log.info("[Batch Service] ZIP 파일 압축 해제 중...");
            unzip(tempZip, uploadsDir);
            log.info("[Batch Service] 압축 해제 완료!");

            // 4. 임시 파일 삭제
            Files.deleteIfExists(tempZip);
            log.info("[Batch Service] 임시 ZIP 파일 삭제 완료.");

        } catch (Exception e) {
            log.error("[Batch Service] 파일 다운로드 및 압축 해제 중 오류 발생", e);
            throw new RuntimeException("공공데이터 다운로드 자동화 실패: " + e.getMessage(), e);
        }
    }

    private boolean hasDataFiles(Path dir) {
        if (!Files.exists(dir)) {
            return false;
        }
        try (Stream<Path> stream = Files.list(dir)) {
            return stream.anyMatch(path -> {
                String filename = path.getFileName().toString();
                return filename.startsWith("소상공인시장진흥공단_상가") && filename.endsWith(".csv");
            });
        } catch (IOException e) {
            return false;
        }
    }

    private void unzip(Path zipFilePath, Path destDir) throws IOException {
        try (ZipInputStream zipIn = new ZipInputStream(Files.newInputStream(zipFilePath))) {
            ZipEntry entry;
            while ((entry = zipIn.getNextEntry()) != null) {
                Path filePath = destDir.resolve(entry.getName());
                if (entry.isDirectory()) {
                    Files.createDirectories(filePath);
                } else {
                    Files.createDirectories(filePath.getParent());
                    try (BufferedOutputStream bos = new BufferedOutputStream(Files.newOutputStream(filePath))) {
                        byte[] bytesIn = new byte[8192];
                        int read;
                        while ((read = zipIn.read(bytesIn)) != -1) {
                            bos.write(bytesIn, 0, read);
                        }
                    }
                }
                zipIn.closeEntry();
            }
        }
    }
}

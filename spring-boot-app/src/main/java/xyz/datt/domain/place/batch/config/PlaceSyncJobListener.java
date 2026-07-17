package xyz.datt.domain.place.batch.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.listener.JobExecutionListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.place.repository.PlaceMasterRepository;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class PlaceSyncJobListener implements JobExecutionListener {
    private final PlaceMasterRepository placeMasterRepository;

    @Override
    public void beforeJob(JobExecution jobExecution) {
        log.info("[Batch Listener] 배치 동기화 Job 시작 시점 기록");
        jobExecution.getExecutionContext().put("batchStartTime", LocalDateTime.now());
    }

    @Override
    @Transactional
    public void afterJob(JobExecution jobExecution) {
        if (jobExecution.getStatus() == BatchStatus.COMPLETED) {
            log.info("[Batch Listener] 배치 Job 성공 완료. 폐업(CLOSED) 장소 감지 및 일괄 처리 개시...");
            try {
                LocalDateTime batchStartTime = (LocalDateTime) jobExecution.getExecutionContext().get("batchStartTime");
                if (batchStartTime != null) {
                    LocalDateTime safeStartTime = batchStartTime.minusMinutes(5);
                    int updatedCount = placeMasterRepository.updateClosedPlaces(safeStartTime);
                    log.info("[Batch Listener] 폐업 처리 완료. 비활성화된 장소 수: {}개", updatedCount);
                }
            } catch (Exception e) {
                log.error("[Batch Listener] 폐업 일괄 처리 중 에러 발생", e);
            }
        }
    }
}

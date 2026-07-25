package xyz.datt.domain.place.batch.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.place.batch.service.PlaceBatchService;

/**
 * 장소(Place) 데이터 처리를 위한 배치 작업을 관리자가 수동으로 실행할 수 있도록 하는 컨트롤러입니다.
 * 장소 데이터 동기화 또는 일괄 처리 로직을 비동기적으로 실행하도록 유도합니다.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/batch")
public class PlaceBatchController {
    private final PlaceBatchService placeBatchService;

    /**
     * 장소 데이터 배치 작업을 백그라운드 스레드에서 비동기적으로 실행합니다.
     *
     * [Call Graph]
     * 1. 관리자가 배치 실행 엔드포인트(/api/admin/batch/run) 호출.
     * 2. PlaceBatchService.runBatch()가 호출되며, 해당 메서드는 @Async 등으로 인해 별도 스레드에서 수행됨.
     * 3. 배치 작업의 완료 여부를 기다리지 않고(non-blocking), 클라이언트에게는 즉시 200 OK와 함께 "배치 실행이 시작되었다"는 메시지를 반환.
     * 4. 배치의 실행 경과 및 결과는 서버의 로그를 통해 확인 가능.
     *
     * @return 배치 실행 시작 알림 문자열
     */
    @PostMapping("/run")
    public ResponseEntity<String> runBatch() {
        // 서비스의 비동기 메서드를 호출 (스레드가 분리됨)
        placeBatchService.runBatch();

        // 배치가 끝나길 기다리지 않고 바로 200 OK 응답을 리턴
        return ResponseEntity.ok("배치 실행이 백그라운드에서 시작되었습니다. 로그를 확인해주세요.");
    }
}
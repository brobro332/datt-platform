package xyz.datt.domain.place.batch.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.place.batch.service.PlaceBatchService;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/batch")
public class PlaceBatchController {
    private final PlaceBatchService placeBatchService;

    @PostMapping("/run")
    public ResponseEntity<String> runBatch() {
        // 서비스의 비동기 메서드를 호출 (스레드가 분리됨)
        placeBatchService.runBatch();

        // 배치가 끝나길 기다리지 않고 바로 200 OK 응답을 리턴
        return ResponseEntity.ok("배치 실행이 백그라운드에서 시작되었습니다. 로그를 확인해주세요.");
    }
}
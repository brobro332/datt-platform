package xyz.datt.domain.place.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.place.service.SubwayStationService;

/**
 * 관리자가 지하철역(Subway Station) 마스터 데이터를 동기화 및 관리하기 위해 사용하는 컨트롤러입니다.
 * 외부 API 연동 또는 내부 로직을 통해 지하철역 정보를 최신 상태로 갱신하는 요청을 처리합니다.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/subway-stations")
public class AdminSubwayStationController {

    private final SubwayStationService subwayStationService;

    /**
     * 지하철역 마스터 데이터 동기화를 수동으로 시작합니다.
     * 
     * [Call Graph]
     * 1. 클라이언트(관리자)가 POST /api/admin/subway-stations/sync 요청.
     * 2. SubwayStationService.syncSubwayStations()가 호출되어 동기화 작업이 수행됨 (DB 업데이트 등).
     * 3. 동기화가 성공적으로 완료되면 200 OK와 함께 결과 메시지를 반환.
     * 
     * @return 동기화 완료 알림 문자열
     */
    @PostMapping("/sync")
    public ResponseEntity<String> syncSubwayStations() {
        log.info("Starting subway station master data sync...");
        subwayStationService.syncSubwayStations();
        return ResponseEntity.ok("지하철역 마스터 데이터 동기화가 성공적으로 완료되었습니다.");
    }
}

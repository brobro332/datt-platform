package xyz.datt.domain.place.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.place.service.SubwayStationService;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/subway-stations")
public class AdminSubwayStationController {

    private final SubwayStationService subwayStationService;

    @PostMapping("/sync")
    public ResponseEntity<String> syncSubwayStations() {
        log.info("Starting subway station master data sync...");
        subwayStationService.syncSubwayStations();
        return ResponseEntity.ok("지하철역 마스터 데이터 동기화가 성공적으로 완료되었습니다.");
    }
}

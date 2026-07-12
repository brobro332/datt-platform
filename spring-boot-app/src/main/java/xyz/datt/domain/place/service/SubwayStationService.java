package xyz.datt.domain.place.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.place.dto.SubwayStationResponse;
import xyz.datt.domain.place.entity.SubwayStation;
import xyz.datt.domain.place.repository.SubwayStationRepository;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubwayStationService {

    private final SubwayStationRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<SubwayStationResponse> getSubwayStations(String province, String district) {
        if (province == null || district == null) {
            return repository.findAll().stream()
                .map(SubwayStationResponse::from)
                .collect(Collectors.toList());
        }
        return repository.findByProvinceAndDistrict(province, district).stream()
            .map(SubwayStationResponse::from)
            .collect(Collectors.toList());
    }

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    @Transactional
    public void initSubwayStations() {
        log.info("Initializing/Syncing subway station master data...");
        syncSubwayStations();
    }

    @Transactional
    public void syncSubwayStations() {
        try {
            ClassPathResource resource = new ClassPathResource("data/subway_stations.json");
            try (InputStream inputStream = resource.getInputStream()) {
                Map<String, Object> data = objectMapper.readValue(inputStream, Map.class);
                List<Map<String, Object>> stations = (List<Map<String, Object>>) data.get("stations");
                if (stations != null) {
                    for (Map<String, Object> stationMap : stations) {
                        String name = (String) stationMap.get("name");
                        String line = (String) stationMap.get("line");
                        String province = (String) stationMap.get("province");
                        String district = (String) stationMap.get("district");
                        Double lat = ((Number) stationMap.get("lat")).doubleValue();
                        Double lon = ((Number) stationMap.get("lon")).doubleValue();

                        Optional<SubwayStation> optionalStation = repository.findByNameAndLine(name, line);
                        if (optionalStation.isPresent()) {
                            SubwayStation existing = optionalStation.get();
                            existing.update(line, province, district, lat, lon);
                        } else {
                            SubwayStation newStation = SubwayStation.builder()
                                .name(name)
                                .line(line)
                                .province(province)
                                .district(district)
                                .lat(lat)
                                .lon(lon)
                                .build();
                            repository.save(newStation);
                        }
                    }
                    log.info("Successfully synced {} subway stations to the database", stations.size());
                }
            }
        } catch (Exception e) {
            log.error("Failed to sync subway stations:", e);
            throw new RuntimeException("Subway station sync failed", e);
        }
    }
}

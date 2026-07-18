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
            ClassPathResource csvResource = new ClassPathResource("data/subway_stations.csv");
            if (csvResource.exists()) {
                log.info("Found subway_stations.csv. Syncing from CSV...");
                syncFromCsv(csvResource);
            } else {
                ClassPathResource jsonResource = new ClassPathResource("data/subway_stations.json");
                if (jsonResource.exists()) {
                    log.info("Found subway_stations.json. Syncing from JSON...");
                    syncFromJson(jsonResource);
                } else {
                    log.warn("No subway station data files found (CSV or JSON).");
                }
            }
        } catch (Exception e) {
            log.error("Failed to sync subway stations:", e);
            throw new RuntimeException("Subway station sync failed", e);
        }
    }

    private void syncFromJson(ClassPathResource resource) throws Exception {
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

                    saveOrUpdateStation(name, line, province, district, lat, lon);
                }
                log.info("Successfully synced {} subway stations from JSON to the database", stations.size());
            }
        }
    }

    private void syncFromCsv(ClassPathResource resource) throws Exception {
        try (InputStream inputStream = resource.getInputStream();
             java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(inputStream, "UTF-8"))) {
            
            String headerLine = reader.readLine();
            if (headerLine == null) return;
            
            if (headerLine.startsWith("\uFEFF")) {
                headerLine = headerLine.substring(1);
            }
            
            List<String> headers = parseCsvLine(headerLine);
            Map<String, Integer> headerMap = new java.util.HashMap<>();
            for (int i = 0; i < headers.size(); i++) {
                headerMap.put(headers.get(i).trim(), i);
            }
            
            int nameIdx = headerMap.getOrDefault("역사명", headerMap.getOrDefault("역명", -1));
            int lineIdx = headerMap.getOrDefault("노선명", -1);
            int latIdx = headerMap.getOrDefault("역위도", headerMap.getOrDefault("위도", -1));
            int lonIdx = headerMap.getOrDefault("역경도", headerMap.getOrDefault("경도", -1));
            int addrIdx = headerMap.getOrDefault("역사도로명주소", headerMap.getOrDefault("도로명주소", -1));
            
            if (nameIdx == -1 || lineIdx == -1 || latIdx == -1 || lonIdx == -1 || addrIdx == -1) {
                log.error("Required columns not found in CSV. Headers: {}", headers);
                throw new IllegalArgumentException("Invalid CSV headers");
            }
            
            String line;
            int count = 0;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                List<String> fields = parseCsvLine(line);
                if (fields.size() <= Math.max(Math.max(nameIdx, lineIdx), Math.max(Math.max(latIdx, lonIdx), addrIdx))) {
                    continue;
                }
                
                String name = fields.get(nameIdx).trim();
                if (name.isEmpty()) continue;
                if (!name.endsWith("역")) {
                    name += "역";
                }
                
                String lineName = fields.get(lineIdx).trim();
                String address = fields.get(addrIdx).trim();
                
                Double lat;
                Double lon;
                try {
                    lat = Double.parseDouble(fields.get(latIdx).trim());
                    lon = Double.parseDouble(fields.get(lonIdx).trim());
                } catch (NumberFormatException e) {
                    continue;
                }
                
                String[] region = parseRegion(address);
                String province = region[0];
                String district = region[1];
                
                saveOrUpdateStation(name, lineName, province, district, lat, lon);
                count++;
            }
            log.info("Successfully synced {} subway stations from CSV to the database", count);
        }
    }

    private void saveOrUpdateStation(String name, String line, String province, String district, Double lat, Double lon) {
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

    private List<String> parseCsvLine(String line) {
        List<String> result = new java.util.ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(current.toString().trim());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        result.add(current.toString().trim());
        return result;
    }

    private String[] parseRegion(String address) {
        if (address == null || address.trim().isEmpty()) {
            return new String[]{"기타", "기타"};
        }
        String[] parts = address.split("\\s+");
        if (parts.length < 2) {
            return new String[]{parts[0], "기타"};
        }
        String province = parts[0];
        String district = parts[1];
        
        if (parts.length >= 3 && (district.endsWith("시") || district.endsWith("군")) && parts[2].endsWith("구")) {
            district = district + " " + parts[2];
        }
        
        if (province.equals("서울")) province = "서울특별시";
        else if (province.equals("경기")) province = "경기도";
        else if (province.equals("부산")) province = "부산광역시";
        else if (province.equals("대구")) province = "대구광역시";
        else if (province.equals("인천")) province = "인천광역시";
        else if (province.equals("광주")) province = "광주광역시";
        else if (province.equals("대전")) province = "대전광역시";
        else if (province.equals("울산")) province = "울산광역시";
        else if (province.equals("세종")) province = "세종특별자치시";
        else if (province.equals("강원")) province = "강원특별자치도";
        else if (province.equals("충북")) province = "충청북도";
        else if (province.equals("충남")) province = "충청남도";
        else if (province.equals("전북")) province = "전북특별자치도";
        else if (province.equals("전남")) province = "전라남도";
        else if (province.equals("경북")) province = "경상북도";
        else if (province.equals("경남")) province = "경상남도";
        else if (province.equals("제주")) province = "제주특별자치도";
        
        return new String[]{province, district};
    }
}

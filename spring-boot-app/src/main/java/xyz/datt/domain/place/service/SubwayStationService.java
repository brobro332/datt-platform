package xyz.datt.domain.place.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import xyz.datt.domain.place.dto.SubwayStationResponse;
import xyz.datt.domain.place.entity.SubwayStation;
import xyz.datt.domain.place.repository.SubwayStationRepository;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamReader;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubwayStationService {

    private final SubwayStationRepository repository;
    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${public-data.place.service-key}")
    private String serviceKey;

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
            log.info("Attempting to sync subway stations from official Excel portal (data.kric.go.kr)...");
            syncFromOfficialExcel();
        } catch (Exception excelEx) {
            log.warn("Failed to sync from official Excel portal: {}. Falling back to local data...", excelEx.getMessage());
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
            } catch (Exception localEx) {
                log.error("Failed to sync subway stations from fallback files:", localEx);
                throw new RuntimeException("Subway station sync failed", localEx);
            }
        }
    }

    private void syncFromJson(ClassPathResource resource) throws Exception {
        try (InputStream inputStream = resource.getInputStream()) {
            Map<String, Object> data = objectMapper.readValue(inputStream, Map.class);
            List<Map<String, Object>> stations = (List<Map<String, Object>>) data.get("stations");
            if (stations != null) {
                List<SubwayStation> stationsToSave = new ArrayList<>();
                for (Map<String, Object> stationMap : stations) {
                    String name = (String) stationMap.get("name");
                    String line = (String) stationMap.get("line");
                    String province = (String) stationMap.get("province");
                    String district = (String) stationMap.get("district");
                    Double lat = ((Number) stationMap.get("lat")).doubleValue();
                    Double lon = ((Number) stationMap.get("lon")).doubleValue();

                    stationsToSave.add(SubwayStation.builder()
                        .name(name)
                        .line(line)
                        .province(province)
                        .district(district)
                        .lat(lat)
                        .lon(lon)
                        .build());
                }
                if (!stationsToSave.isEmpty()) {
                    repository.deleteAllInBatch();
                    repository.saveAll(stationsToSave);
                }
                log.info("Successfully synced {} subway stations from JSON to the database", stationsToSave.size());
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
            List<SubwayStation> stationsToSave = new ArrayList<>();
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                List<String> fields = parseCsvLine(line);
                if (fields.size() <= Math.max(Math.max(nameIdx, lineIdx), Math.max(Math.max(latIdx, lonIdx), addrIdx))) {
                    continue;
                }
                
                String name = fields.get(nameIdx).trim();
                if (name.isEmpty()) continue;
                name = normalizeStationName(name);
                
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
                
                stationsToSave.add(SubwayStation.builder()
                    .name(name)
                    .line(lineName)
                    .province(province)
                    .district(district)
                    .lat(lat)
                    .lon(lon)
                    .build());
            }
            if (!stationsToSave.isEmpty()) {
                repository.deleteAllInBatch();
                repository.saveAll(stationsToSave);
            }
            log.info("Successfully synced {} subway stations from CSV to the database", stationsToSave.size());
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

    private String normalizeStationName(String name) {
        if (name == null) return "";
        name = name.trim();
        
        if (name.endsWith("역")) {
            name = name.substring(0, name.length() - 1);
        }
        
        if (name.contains("(")) {
            int openParenIdx = name.indexOf("(");
            String mainName = name.substring(0, openParenIdx).trim();
            String subName = name.substring(openParenIdx).trim();
            
            if (mainName.endsWith("역")) {
                mainName = mainName.substring(0, mainName.length() - 1);
            }
            
            return mainName + "역" + subName;
        } else {
            return name + "역";
        }
    }

    private void syncFromOfficialExcel() {
        try {
            log.info("Downloading official subway station XLSX from data.kric.go.kr...");
            byte[] excelBytes = restClient.get()
                .uri("https://data.kric.go.kr/rips/dataset/download.file?type=filedata&id=32&operation=1")
                .retrieve()
                .body(byte[].class);
            
            if (excelBytes == null || excelBytes.length == 0) {
                throw new RuntimeException("Failed to download official Excel file: empty content");
            }
            
            log.info("Successfully downloaded official Excel file ({} bytes). Parsing...", excelBytes.length);
            
            List<String> sharedStrings = new ArrayList<>();
            Map<Integer, List<String>> rows = new HashMap<>();
            
            try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(excelBytes))) {
                ZipEntry entry;
                byte[] sharedStringsBytes = null;
                byte[] sheetBytes = null;
                
                while ((entry = zis.getNextEntry()) != null) {
                    if ("xl/sharedStrings.xml".equals(entry.getName())) {
                        sharedStringsBytes = zis.readAllBytes();
                    } else if ("xl/worksheets/sheet1.xml".equals(entry.getName())) {
                        sheetBytes = zis.readAllBytes();
                    }
                    zis.closeEntry();
                }
                
                if (sharedStringsBytes != null) {
                    sharedStrings = parseSharedStrings(sharedStringsBytes);
                }
                if (sheetBytes != null) {
                    rows = parseSheet(sheetBytes, sharedStrings);
                }
            }
            
            if (rows.isEmpty()) {
                throw new RuntimeException("No rows found in official Excel sheet");
            }
            
            int minRowIdx = rows.keySet().stream().min(Integer::compareTo).orElse(0);
            List<String> headers = rows.get(minRowIdx);
            if (headers == null || headers.isEmpty()) {
                throw new RuntimeException("Header row is empty");
            }
            
            Map<String, Integer> headerMap = new HashMap<>();
            for (int i = 0; i < headers.size(); i++) {
                headerMap.put(headers.get(i).trim(), i);
            }
            
            int nameIdx = headerMap.getOrDefault("역사명", headerMap.getOrDefault("역명", -1));
            int lineIdx = headerMap.getOrDefault("노선명", -1);
            int latIdx = headerMap.getOrDefault("역위도", headerMap.getOrDefault("위도", -1));
            int lonIdx = headerMap.getOrDefault("역경도", headerMap.getOrDefault("경도", -1));
            int addrIdx = headerMap.getOrDefault("역사도로명주소", headerMap.getOrDefault("도로명주소", -1));
            
            if (nameIdx == -1 || lineIdx == -1 || latIdx == -1 || lonIdx == -1 || addrIdx == -1) {
                log.error("Required columns not found in Excel. Headers: {}", headers);
                throw new IllegalArgumentException("Invalid Excel headers");
            }
            
            List<SubwayStation> stationsToSave = new ArrayList<>();
            for (Map.Entry<Integer, List<String>> rowEntry : rows.entrySet()) {
                if (rowEntry.getKey() == minRowIdx) continue; // Skip header
                List<String> fields = rowEntry.getValue();
                
                if (fields.size() <= Math.max(Math.max(nameIdx, lineIdx), Math.max(Math.max(latIdx, lonIdx), addrIdx))) {
                    continue;
                }
                
                String name = fields.get(nameIdx).trim();
                if (name.isEmpty()) continue;
                name = normalizeStationName(name);
                
                String lineName = fields.get(lineIdx).trim();
                String address = fields.get(addrIdx).trim();
                
                Double lat = null;
                Double lon = null;
                try {
                    String latStr = fields.get(latIdx).trim();
                    String lonStr = fields.get(lonIdx).trim();
                    if (!latStr.isEmpty() && !lonStr.isEmpty()) {
                        lat = Double.parseDouble(latStr);
                        lon = Double.parseDouble(lonStr);
                    }
                } catch (NumberFormatException e) {
                    continue;
                }
                
                if (lat == null || lon == null) continue;
                
                String[] region = parseRegion(address);
                String province = region[0];
                String district = region[1];
                
                stationsToSave.add(SubwayStation.builder()
                    .name(name)
                    .line(lineName)
                    .province(province)
                    .district(district)
                    .lat(lat)
                    .lon(lon)
                    .build());
            }
            
            if (!stationsToSave.isEmpty()) {
                repository.deleteAllInBatch();
                repository.saveAll(stationsToSave);
            }
            log.info("Successfully synced {} subway stations from data.kric.go.kr Excel to database", stationsToSave.size());
            
        } catch (Exception e) {
            log.error("Failed to sync from official Excel", e);
            throw new RuntimeException("Official Excel sync failed: " + e.getMessage(), e);
        }
    }

    private List<String> parseSharedStrings(byte[] xmlBytes) throws Exception {
        List<String> list = new ArrayList<>();
        XMLInputFactory factory = XMLInputFactory.newInstance();
        factory.setProperty(XMLInputFactory.SUPPORT_DTD, false);
        factory.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
        
        try (InputStream in = new ByteArrayInputStream(xmlBytes)) {
            XMLStreamReader reader = factory.createXMLStreamReader(in);
            StringBuilder siBuffer = new StringBuilder();
            boolean insideSi = false;
            boolean insideT = false;
            
            while (reader.hasNext()) {
                int event = reader.next();
                if (event == XMLStreamConstants.START_ELEMENT) {
                    String localName = reader.getLocalName();
                    if ("si".equals(localName)) {
                        insideSi = true;
                        siBuffer.setLength(0);
                    } else if ("t".equals(localName) && insideSi) {
                        insideT = true;
                    }
                } else if (event == XMLStreamConstants.CHARACTERS) {
                    if (insideT) {
                        siBuffer.append(reader.getText());
                    }
                } else if (event == XMLStreamConstants.END_ELEMENT) {
                    String localName = reader.getLocalName();
                    if ("t".equals(localName)) {
                        insideT = false;
                    } else if ("si".equals(localName)) {
                        insideSi = false;
                        list.add(siBuffer.toString());
                    }
                }
            }
        }
        return list;
    }

    private Map<Integer, List<String>> parseSheet(byte[] xmlBytes, List<String> sharedStrings) throws Exception {
        Map<Integer, List<String>> rows = new HashMap<>();
        XMLInputFactory factory = XMLInputFactory.newInstance();
        factory.setProperty(XMLInputFactory.SUPPORT_DTD, false);
        factory.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
        
        try (InputStream in = new ByteArrayInputStream(xmlBytes)) {
            XMLStreamReader reader = factory.createXMLStreamReader(in);
            
            int currentRowIdx = -1;
            Map<Integer, String> currentRowData = null;
            int currentColIdx = -1;
            String currentType = "";
            boolean insideV = false;
            StringBuilder vBuffer = new StringBuilder();
            
            while (reader.hasNext()) {
                int event = reader.next();
                if (event == XMLStreamConstants.START_ELEMENT) {
                    String localName = reader.getLocalName();
                    if ("row".equals(localName)) {
                        String rAttr = reader.getAttributeValue(null, "r");
                        if (rAttr != null) {
                            currentRowIdx = Integer.parseInt(rAttr);
                        }
                        currentRowData = new HashMap<>();
                    } else if ("c".equals(localName)) {
                        String rAttr = reader.getAttributeValue(null, "r");
                        if (rAttr != null) {
                            currentColIdx = getColumnIndex(rAttr);
                        }
                        currentType = reader.getAttributeValue(null, "t");
                        if (currentType == null) {
                            currentType = "";
                        }
                    } else if ("v".equals(localName)) {
                        insideV = true;
                        vBuffer.setLength(0);
                    }
                } else if (event == XMLStreamConstants.CHARACTERS) {
                    if (insideV) {
                        vBuffer.append(reader.getText());
                    }
                } else if (event == XMLStreamConstants.END_ELEMENT) {
                    String localName = reader.getLocalName();
                    if ("v".equals(localName)) {
                        insideV = false;
                        String val = vBuffer.toString();
                        if ("s".equals(currentType)) {
                            try {
                                int idx = Integer.parseInt(val);
                                if (idx >= 0 && idx < sharedStrings.size()) {
                                    val = sharedStrings.get(idx);
                                }
                            } catch (NumberFormatException e) {
                                // ignore
                            }
                        }
                        if (currentRowData != null && currentColIdx != -1) {
                            currentRowData.put(currentColIdx, val);
                        }
                    } else if ("row".equals(localName)) {
                        if (currentRowData != null && currentRowIdx != -1) {
                            int maxCol = currentRowData.keySet().stream().max(Integer::compareTo).orElse(-1);
                            List<String> rowList = new ArrayList<>();
                            for (int i = 0; i <= maxCol; i++) {
                                rowList.add(currentRowData.getOrDefault(i, ""));
                            }
                            rows.put(currentRowIdx, rowList);
                        }
                        currentRowIdx = -1;
                        currentRowData = null;
                    }
                }
            }
        }
        return rows;
    }

    private int getColumnIndex(String ref) {
        StringBuilder letters = new StringBuilder();
        for (int i = 0; i < ref.length(); i++) {
            char c = ref.charAt(i);
            if (Character.isLetter(c)) {
                letters.append(c);
            } else {
                break;
            }
        }
        
        String colLetter = letters.toString().toUpperCase();
        int colIdx = 0;
        for (int i = 0; i < colLetter.length(); i++) {
            colIdx = colIdx * 26 + (colLetter.charAt(i) - 'A' + 1);
        }
        return colIdx - 1;
    }
}

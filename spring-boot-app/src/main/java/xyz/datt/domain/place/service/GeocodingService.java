package xyz.datt.domain.place.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import xyz.datt.domain.place.dto.PlaceAdminDto.GeocodingResponse;
import xyz.datt.global.error.BusinessException;
import xyz.datt.global.error.ErrorCode;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeocodingService {
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.kakao.client-id:}")
    private String kakaoApiKey;

    @SuppressWarnings("unchecked")
    public GeocodingResponse geocode(String address) {
        if (address == null || address.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "주소는 필수 입력 사항입니다.");
        }

        if (kakaoApiKey == null || kakaoApiKey.isBlank()) {
            log.error("Kakao Client ID (REST API Key) is not configured.");
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "카카오 API 키 설정이 올바르지 않습니다.");
        }

        String url = "https://dapi.kakao.com/v2/local/search/address.json";
        URI uri = UriComponentsBuilder.fromUriString(url)
                .queryParam("query", address)
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoApiKey);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> responseEntity = restTemplate.exchange(uri, HttpMethod.GET, requestEntity, Map.class);
            if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                Map<String, Object> body = responseEntity.getBody();
                List<Map<String, Object>> documents = (List<Map<String, Object>>) body.get("documents");

                if (documents == null || documents.isEmpty()) {
                    throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "해당 주소의 위치 정보를 찾을 수 없습니다.");
                }

                Map<String, Object> firstDoc = documents.get(0);
                String addressName = (String) firstDoc.get("address_name");
                Double longitude = Double.parseDouble((String) firstDoc.get("x"));
                Double latitude = Double.parseDouble((String) firstDoc.get("y"));

                String roadAddressName = "";
                Map<String, Object> roadAddress = (Map<String, Object>) firstDoc.get("road_address");
                if (roadAddress != null) {
                    roadAddressName = (String) roadAddress.get("address_name");
                }

                String jibunAddressName = "";
                String ctprvnNm = "";
                String signguNm = "";
                String adongNm = "";

                Map<String, Object> addressInfo = (Map<String, Object>) firstDoc.get("address");
                if (addressInfo != null) {
                    jibunAddressName = (String) addressInfo.get("address_name");
                    ctprvnNm = (String) addressInfo.get("region_1depth_name");
                    signguNm = (String) addressInfo.get("region_2depth_name");
                    adongNm = (String) addressInfo.get("region_3depth_name");
                }

                return new GeocodingResponse(
                        addressName,
                        roadAddressName,
                        jibunAddressName,
                        longitude,
                        latitude,
                        ctprvnNm,
                        signguNm,
                        adongNm
                );
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to call Kakao Local Geocoding API for address: '{}'", address, e);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "카카오 주소 변환 중 오류가 발생했습니다.");
        }

        throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "주소 변환에 실패했습니다.");
    }
}

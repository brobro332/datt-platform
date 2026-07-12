package xyz.datt.domain.auth.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class KakaoClient {
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.kakao.client-id:}")
    private String clientId;

    @Value("${app.kakao.redirect-uri:}")
    private String redirectUri;

    @Value("${app.kakao.client-secret:}")
    private String clientSecret;

    public String getAccessToken(String code) {
        String tokenUrl = "https://kauth.kakao.com/oauth/token";

        log.error("[KAKAO LOGIN DEBUG] clientId: '{}', redirectUri: '{}', clientSecretLength: '{}', code: '{}'", 
                clientId, redirectUri, clientSecret != null ? clientSecret.length() : 0, code);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);
        
        if (clientSecret != null && !clientSecret.trim().isEmpty()) {
            params.add("client_secret", clientSecret);
        }

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
        } catch (Exception e) {
            log.error("Failed to get Kakao Access Token", e);
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getUserInfo(String accessToken) {
        String userInfoUrl = "https://kapi.kakao.com/v2/user/me";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(userInfoUrl, HttpMethod.GET, request, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Failed to get Kakao User Info", e);
        }
        return null;
    }
}

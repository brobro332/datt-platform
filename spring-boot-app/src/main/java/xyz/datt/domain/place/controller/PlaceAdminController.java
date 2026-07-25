package xyz.datt.domain.place.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.place.dto.PlaceAdminDto.GeocodingResponse;
import xyz.datt.domain.place.dto.PlaceAdminDto.PlaceCreateRequest;
import xyz.datt.domain.place.entity.PlaceMaster;
import xyz.datt.domain.place.repository.PlaceMasterRepository;
import xyz.datt.domain.place.service.GeocodingService;
import xyz.datt.domain.admin.service.AdminActivityLogService;
import xyz.datt.global.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import xyz.datt.global.response.ApiResponse;

import java.util.UUID;

/**
 * 장소(Place) 데이터와 관련된 관리자 전용 기능을 제공하는 컨트롤러입니다.
 * 주소 텍스트를 위/경도 좌표로 변환하는 지오코딩과, 관리자가 수동으로 새로운 장소를 등록하는 기능을 포함합니다.
 */
@RestController
@RequiredArgsConstructor
public class PlaceAdminController {
    private final GeocodingService geocodingService;
    private final PlaceMasterRepository placeMasterRepository;
    private final AdminActivityLogService adminActivityLogService;

    /**
     * 입력된 주소(address)를 기반으로 지오코딩을 수행하여 위치 정보(위도, 경도 등)를 반환합니다.
     * 
     * [Call Graph]
     * 1. 주소 문자열(address)을 쿼리 파라미터로 받아 GeocodingService.geocode(address) 호출.
     * 2. 외부 API(예: 네이버, 카카오)나 내부 로직을 통해 좌표 정보(GeocodingResponse)를 획득하여 반환.
     *
     * @param address 좌표로 변환할 대상 주소
     * @return 지오코딩 결과 (위도 및 경도)
     */
    @GetMapping("/api/admin/places/geocode")
    public ApiResponse<GeocodingResponse> geocode(@RequestParam String address) {
        GeocodingResponse response = geocodingService.geocode(address);
        return ApiResponse.success(response);
    }

    /**
     * 관리자가 수동으로 신규 장소(상가업소) 마스터 데이터를 생성합니다.
     *
     * [Call Graph]
     * 1. PlaceCreateRequest(입력 폼 데이터)를 검증(@Valid)하여 수신.
     * 2. request에 포함된 장소 카테고리(FOOD, CAFE, BAR, STAY, PLAY)를 바탕으로 상권업종 대/중/소분류 코드를 매핑.
     * 3. 'MANUAL-' 프리픽스와 랜덤 UUID를 결합해 임의의 상가업소번호(bizesId) 생성.
     * 4. PlaceMaster 엔티티를 생성하고 위치 정보(POINT(경도 위도))를 포함하여 세팅 후 placeMasterRepository.save()로 DB 저장.
     * 5. 등록을 수행한 관리자(userDetails) 정보가 있다면 AdminActivityLogService.logActivity()를 호출하여 관리자 활동 로그(CREATE_PLACE)를 저장.
     * 6. 생성 완료된 장소 엔티티를 클라이언트에 응답.
     *
     * @param request 신규 장소 생성을 위한 정보가 담긴 DTO
     * @param userDetails 현재 로그인한 관리자의 인증 정보
     * @param httpRequest 현재 요청의 HttpServletRequest 객체 (활동 로그 기록 시 IP 등을 얻기 위해 사용)
     * @return 생성된 장소 마스터 엔티티 정보
     */
    @PostMapping("/api/admin/places")
    public ApiResponse<PlaceMaster> createPlace(
            @Valid @RequestBody PlaceCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest httpRequest
    ) {
        String category = request.category().toUpperCase();

        String indsLclsCd = "I2";
        String indsLclsNm = "음식";
        String indsMclsCd = "I201";
        String indsMclsNm = "한식";
        String indsSclsCd = "I20101";
        String indsSclsNm = "한식 일반";

        switch (category) {
            case "FOOD" -> {
                indsLclsCd = "I2";
                indsLclsNm = "음식";
                indsMclsCd = "I201";
                indsMclsNm = "한식";
                indsSclsCd = "I20101";
                indsSclsNm = "한식 일반";
            }
            case "CAFE" -> {
                indsLclsCd = "I2";
                indsLclsNm = "음식";
                indsMclsCd = "I212";
                indsMclsNm = "비알코올";
                indsSclsCd = "I21201";
                indsSclsNm = "카페";
            }
            case "BAR" -> {
                indsLclsCd = "I2";
                indsLclsNm = "음식";
                indsMclsCd = "I211";
                indsMclsNm = "주점";
                indsSclsCd = "I21101";
                indsSclsNm = "일반주점";
            }
            case "STAY" -> {
                indsLclsCd = "I1";
                indsLclsNm = "숙박";
                indsMclsCd = "I101";
                indsMclsNm = "일반 및 생활 숙박시설";
                indsSclsCd = "I10101";
                indsSclsNm = "여관업";
            }
            case "PLAY" -> {
                indsLclsCd = "R1";
                indsLclsNm = "예술·스포츠·여가";
                indsMclsCd = "R104";
                indsMclsNm = "유원지 및 테마파크";
                indsSclsCd = "R10401";
                indsSclsNm = "종합 유원시설업";
            }
        }

        String bizesId = "MANUAL-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        PlaceMaster placeMaster = PlaceMaster.builder()
                .bizesId(bizesId)
                .bizesNm(request.bizesNm())
                .brchNm(request.brchNm())
                .indsLclsCd(indsLclsCd)
                .indsLclsNm(indsLclsNm)
                .indsMclsCd(indsMclsCd)
                .indsMclsNm(indsMclsNm)
                .indsSclsCd(indsSclsCd)
                .indsSclsNm(indsSclsNm)
                .ctprvnNm(request.ctprvnNm())
                .signguNm(request.signguNm())
                .adongNm(request.adongNm())
                .ldongNm(request.adongNm())
                .lnoAdr(request.lnoAdr())
                .rdnmAdr(request.rdnmAdr())
                .newZipcd("")
                .lon(request.lon())
                .lat(request.lat())
                .location("POINT(" + request.lon() + " " + request.lat() + ")")
                .build();

        PlaceMaster savedPlace = placeMasterRepository.save(placeMaster);

        if (userDetails != null) {
            adminActivityLogService.logActivity(
                    userDetails.getMemberId(),
                    "CREATE_PLACE",
                    String.format("매장 신규 수동 등록 - 상호명: %s, 지점명: %s, 카테고리: %s, 주소: %s",
                            request.bizesNm(),
                            request.brchNm() != null ? request.brchNm() : "(없음)",
                            request.category(),
                            request.rdnmAdr()),
                    httpRequest
            );
        }

        return ApiResponse.success(savedPlace);
    }
}

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

@RestController
@RequiredArgsConstructor
public class PlaceAdminController {
    private final GeocodingService geocodingService;
    private final PlaceMasterRepository placeMasterRepository;
    private final AdminActivityLogService adminActivityLogService;

    @GetMapping("/api/admin/places/geocode")
    public ApiResponse<GeocodingResponse> geocode(@RequestParam String address) {
        GeocodingResponse response = geocodingService.geocode(address);
        return ApiResponse.success(response);
    }

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

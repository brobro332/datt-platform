package xyz.datt.domain.place.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.place.dto.SubwayStationResponse;
import xyz.datt.domain.place.service.SubwayStationService;
import xyz.datt.global.response.ApiResponse;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SubwayStationController {

    private final SubwayStationService subwayStationService;

    @GetMapping("/api/subway-stations")
    public ApiResponse<List<SubwayStationResponse>> getSubwayStations(
        @RequestParam(required = false) String province,
        @RequestParam(required = false) String district
    ) {
        return ApiResponse.success(subwayStationService.getSubwayStations(province, district));
    }
}

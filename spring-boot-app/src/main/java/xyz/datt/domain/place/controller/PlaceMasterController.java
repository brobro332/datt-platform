package xyz.datt.domain.place.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.place.dto.PlaceMasterSearchResponse;
import xyz.datt.domain.place.service.PlaceMasterService;
import xyz.datt.global.response.ApiResponse;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PlaceMasterController {
    private final PlaceMasterService placeMasterService;

    @GetMapping("/api/place-masters")
    public ApiResponse<Slice<PlaceMasterSearchResponse>> searchPlaceMasters(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String province,
        @RequestParam(required = false) String district,
        @RequestParam(required = false) String category,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        String searchKeyword = keyword != null ? keyword.trim() : "";
        return ApiResponse.success(placeMasterService.searchPlaceMasters(province, district, searchKeyword, category, pageable));
    }

    @GetMapping("/api/place-masters/provinces")
    public ApiResponse<List<String>> getProvinces() {
        return ApiResponse.success(placeMasterService.getProvinces());
    }

    @GetMapping("/api/place-masters/districts")
    public ApiResponse<List<String>> getDistricts(@RequestParam String province) {
        return ApiResponse.success(placeMasterService.getDistricts(province));
    }

    @GetMapping("/api/place-masters/region-center")
    public ApiResponse<Double[]> getRegionCenter(
        @RequestParam String province,
        @RequestParam String district
    ) {
        return ApiResponse.success(placeMasterService.getRegionCenter(province, district));
    }
}
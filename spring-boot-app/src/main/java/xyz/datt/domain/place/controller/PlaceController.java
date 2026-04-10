package xyz.datt.domain.place.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import xyz.datt.domain.place.dto.PlaceResponseDto;
import xyz.datt.domain.place.service.PlaceService;
import xyz.datt.global.common.ApiResponse;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/places")
@RequiredArgsConstructor
public class PlaceController {
    private final PlaceService placeService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> search(@RequestParam String keyword) {
        List<PlaceResponseDto> results = placeService.getPlacesFromAllSources(keyword);
        return ResponseEntity.accepted()
            .body(ApiResponse.success(results));
    }
}

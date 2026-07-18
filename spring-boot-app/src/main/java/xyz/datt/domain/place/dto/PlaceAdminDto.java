package xyz.datt.domain.place.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PlaceAdminDto {

    public record GeocodingResponse(
            String addressName,
            String roadAddressName,
            String jibunAddressName,
            Double longitude,
            Double latitude,
            String ctprvnNm,
            String signguNm,
            String adongNm
    ) {}

    public record PlaceCreateRequest(
            @NotBlank(message = "상호명은 필수입니다.")
            String bizesNm,

            String brchNm,

            @NotBlank(message = "카테고리는 필수입니다.")
            String category, // FOOD, CAFE, BAR, STAY, PLAY

            @NotBlank(message = "도로명주소는 필수입니다.")
            String rdnmAdr,

            @NotBlank(message = "지번주소는 필수입니다.")
            String lnoAdr,

            @NotNull(message = "경도는 필수입니다.")
            Double lon,

            @NotNull(message = "위도는 필수입니다.")
            Double lat,

            @NotBlank(message = "시도명은 필수입니다.")
            String ctprvnNm,

            @NotBlank(message = "시군구명은 필수입니다.")
            String signguNm,

            @NotBlank(message = "행정동명은 필수입니다.")
            String adongNm
    ) {}
}

package xyz.datt.domain.place.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;
import java.util.Optional;

@Getter
@RequiredArgsConstructor
public enum PlaceIndustryCategory {
    KOREAN_FOOD("I201", "한식"),
    CHINESE_FOOD("I202", "중식"),
    JAPANESE_FOOD("I203", "일식"),
    WESTERN_FOOD("I204", "서양식"),
    SOUTHEAST_ASIAN_FOOD("I205", "동남아시아"),
    OTHER_FOREIGN_FOOD("I206", "기타 외국"),
    CAFE("I207", "커피점/카페"),
    BAR("I208", "주점"),
    MOBILE_FOOD("I209", "이동 음식"),
    SIMPLE_FOOD("I210", "기타 간이"),
    
    // Old codes (kept for compatibility during transition or if API still supports)
    OLD_BAR("I211", "주점(구)"),
    OLD_CAFE("I212", "비알코올(구)"),

    HOTEL("I101", "호텔"),
    CONDO("I102", "콘도"),
    CAMPING("I103", "캠핑"),
    STAY_OTHER("I104", "기타 숙박"),

    SPORTS("R103", "스포츠 서비스"),
    AMUSEMENT("R104", "유원지·오락"),
    PC_ROOM("R105", "PC방/게임장"),
    KARAOKE("R106", "노래방");

    private final String code;
    private final String name;

    public static Optional<PlaceIndustryCategory> fromCode(String code) {
        return Arrays.stream(values())
            .filter(category -> category.code.equals(code))
            .findFirst();
    }
}
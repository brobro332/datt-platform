package xyz.datt.domain.anchor.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@RequiredArgsConstructor
public enum AnchorPlaceCategory {
    FOOD("맛집", List.of("I201", "I202", "I203", "I204", "I205", "I206", "I209", "I210")),
    CAFE("카페", List.of("I207", "I212")),
    BAR("술집", List.of("I208", "I211")),
    STAY("숙소", List.of("I101", "I102", "I103", "I104", "I105", "I106", "I107", "I108")),
    PLAY("놀거리", List.of("R101", "R102", "R103", "R104", "R105", "R106", "R107", "R108", "R109"));

    private final String description;
    private final List<String> middleCategoryCodes;
 
    public static AnchorPlaceCategory fromIndsMclsCd(String indsMclsCd) {
        if (indsMclsCd == null) {
            return null;
        }
        for (AnchorPlaceCategory category : values()) {
            if (category.middleCategoryCodes.contains(indsMclsCd)) {
                return category;
            }
        }
        return null;
    }
}
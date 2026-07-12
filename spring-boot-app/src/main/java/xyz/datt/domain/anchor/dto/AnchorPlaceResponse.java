package xyz.datt.domain.anchor.dto;

import xyz.datt.domain.anchor.entity.AnchorPlace;
import xyz.datt.domain.anchor.entity.AnchorPlaceCategory;

public record AnchorPlaceResponse(
    Long placeId,

    String bizesNm,
    String brchNm,

    String indsMclsCd,
    String indsMclsNm,

    String rdnmAdr,

    Double lon,
    Double lat,

    Double distanceKm,

    int recommendOrder,
    String category
) {

    public static AnchorPlaceResponse from(AnchorPlace anchorPlace) {
        return new AnchorPlaceResponse(
            anchorPlace.getPlaceMaster().getId(),

            anchorPlace.getPlaceMaster().getBizesNm(),
            anchorPlace.getPlaceMaster().getBrchNm(),

            anchorPlace.getPlaceMaster().getIndsMclsCd(),
            anchorPlace.getPlaceMaster().getIndsMclsNm(),

            anchorPlace.getPlaceMaster().getRdnmAdr(),

            anchorPlace.getPlaceMaster().getLon(),
            anchorPlace.getPlaceMaster().getLat(),

            anchorPlace.getDistanceKm(),

            anchorPlace.getRecommendOrder(),
            AnchorPlaceCategory.fromIndsMclsCd(anchorPlace.getPlaceMaster().getIndsMclsCd()) != null 
                ? AnchorPlaceCategory.fromIndsMclsCd(anchorPlace.getPlaceMaster().getIndsMclsCd()).name() 
                : "OTHER"
        );
    }
}
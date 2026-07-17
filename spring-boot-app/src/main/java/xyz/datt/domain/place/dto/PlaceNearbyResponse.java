package xyz.datt.domain.place.dto;

import xyz.datt.domain.anchor.entity.AnchorPlaceCategory;

public record PlaceNearbyResponse(
    Long id,
    String bizesNm,
    String brchNm,
    String indsMclsCd,
    String indsMclsNm,
    String ctprvnNm,
    String signguNm,
    String adongNm,
    String rdnmAdr,
    Double lon,
    Double lat,
    Double distanceKm,
    Double averageRating,
    Long reviewCount,
    String category,
    String thumbnailUrl
) {

    public PlaceNearbyResponse(
        Long id,
        String bizesNm,
        String brchNm,
        String indsMclsCd,
        String indsMclsNm,
        String ctprvnNm,
        String signguNm,
        String adongNm,
        String rdnmAdr,
        Double lon,
        Double lat,
        Double distanceKm,
        Double averageRating,
        Long reviewCount,
        String thumbnailUrl
    ) {
        this(
            id,
            bizesNm,
            brchNm,
            indsMclsCd,
            indsMclsNm,
            ctprvnNm,
            signguNm,
            adongNm,
            rdnmAdr,
            lon,
            lat,
            distanceKm,
            averageRating,
            reviewCount,
            AnchorPlaceCategory.fromIndsMclsCd(indsMclsCd) != null 
                ? AnchorPlaceCategory.fromIndsMclsCd(indsMclsCd).name() 
                : "OTHER",
            thumbnailUrl
        );
    }
}
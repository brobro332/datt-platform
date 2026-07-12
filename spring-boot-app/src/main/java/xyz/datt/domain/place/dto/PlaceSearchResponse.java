package xyz.datt.domain.place.dto;

import xyz.datt.domain.place.entity.PlaceMaster;
import xyz.datt.domain.anchor.entity.AnchorPlaceCategory;

public record PlaceSearchResponse(
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
    Double averageRating,
    Long reviewCount,
    String category
) {

    public PlaceSearchResponse(
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
        Double averageRating,
        Long reviewCount
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
            averageRating,
            reviewCount,
            AnchorPlaceCategory.fromIndsMclsCd(indsMclsCd) != null 
                ? AnchorPlaceCategory.fromIndsMclsCd(indsMclsCd).name() 
                : "OTHER"
        );
    }

    public static PlaceSearchResponse from(PlaceMaster placeMaster) {
        return new PlaceSearchResponse(
            placeMaster.getId(),
            placeMaster.getBizesNm(),
            placeMaster.getBrchNm(),
            placeMaster.getIndsMclsCd(),
            placeMaster.getIndsMclsNm(),
            placeMaster.getCtprvnNm(),
            placeMaster.getSignguNm(),
            placeMaster.getAdongNm(),
            placeMaster.getRdnmAdr(),
            placeMaster.getLon(),
            placeMaster.getLat(),
            0.0,
            0L
        );
    }
}
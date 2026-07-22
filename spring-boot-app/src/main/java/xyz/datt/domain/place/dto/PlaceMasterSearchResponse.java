package xyz.datt.domain.place.dto;

import xyz.datt.domain.place.entity.PlaceMaster;
import xyz.datt.domain.anchor.entity.AnchorPlaceCategory;

public record PlaceMasterSearchResponse(
    Long id,
    String bizesId,
    String bizesNm,
    String brchNm,
    String indsLclsNm,
    String indsMclsNm,
    String indsSclsNm,
    String ctprvnNm,
    String signguNm,
    String rdnmAdr,
    String lnoAdr,
    Double lon,
    Double lat,
    String category
) {

    public static PlaceMasterSearchResponse from(PlaceMaster placeMaster) {
        return new PlaceMasterSearchResponse(
            placeMaster.getId(),
            placeMaster.getBizesId(),
            placeMaster.getBizesNm(),
            placeMaster.getBrchNm(),
            placeMaster.getIndsLclsNm(),
            placeMaster.getIndsMclsNm(),
            placeMaster.getIndsSclsNm(),
            placeMaster.getCtprvnNm(),
            placeMaster.getSignguNm(),
            placeMaster.getRdnmAdr(),
            placeMaster.getLnoAdr(),
            placeMaster.getLon(),
            placeMaster.getLat(),
            AnchorPlaceCategory.fromIndsMclsCd(placeMaster.getIndsMclsCd()) != null 
                ? AnchorPlaceCategory.fromIndsMclsCd(placeMaster.getIndsMclsCd()).name() 
                : "OTHER"
        );
    }

    public static PlaceMasterSearchResponse fromSearchResponse(PlaceSearchResponse res) {
        return new PlaceMasterSearchResponse(
            res.id(),
            null,
            res.bizesNm(),
            res.brchNm(),
            null,
            res.indsMclsNm(),
            null,
            res.ctprvnNm(),
            res.signguNm(),
            res.rdnmAdr(),
            null,
            res.lon(),
            res.lat(),
            res.category()
        );
    }
}
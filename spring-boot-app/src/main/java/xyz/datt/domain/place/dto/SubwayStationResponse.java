package xyz.datt.domain.place.dto;

import xyz.datt.domain.place.entity.SubwayStation;

public record SubwayStationResponse(
    Long id,
    String name,
    String line,
    String province,
    String district,
    Double lat,
    Double lon
) {
    public static SubwayStationResponse from(SubwayStation station) {
        return new SubwayStationResponse(
            station.getId(),
            station.getName(),
            station.getLine(),
            station.getProvince(),
            station.getDistrict(),
            station.getLat(),
            station.getLon()
        );
    }
}

package xyz.datt.domain.place.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import xyz.datt.global.entity.BaseEntity;

@Getter
@Entity
@Table(
    name = "subway_station",
    indexes = {
        @Index(name = "idx_subway_station_region", columnList = "province, district")
    }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SubwayStation extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String line;

    @Column(nullable = false, length = 100)
    private String province;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(nullable = false)
    private Double lat;

    @Column(nullable = false)
    private Double lon;

    @Builder
    private SubwayStation(
        String name,
        String line,
        String province,
        String district,
        Double lat,
        Double lon
    ) {
        this.name = name;
        this.line = line;
        this.province = province;
        this.district = district;
        this.lat = lat;
        this.lon = lon;
    }

    public void update(String line, String province, String district, Double lat, Double lon) {
        this.line = line;
        this.province = province;
        this.district = district;
        this.lat = lat;
        this.lon = lon;
    }
}

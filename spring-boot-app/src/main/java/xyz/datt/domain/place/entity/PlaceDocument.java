package xyz.datt.domain.place.entity;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.Setting;
import org.springframework.data.elasticsearch.annotations.MultiField;
import org.springframework.data.elasticsearch.annotations.InnerField;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(indexName = "places", createIndex = false)
@Setting(settingPath = "elasticsearch/settings.json")
public class PlaceDocument {
    @Id
    private String id; // PlaceMaster.id.toString()

    @Field(type = FieldType.Keyword)
    private String bizesId;

    @MultiField(
        mainField = @Field(type = FieldType.Text, analyzer = "korean_analyzer", searchAnalyzer = "korean_analyzer"),
        otherFields = {
            @InnerField(suffix = "ngram", type = FieldType.Text, analyzer = "ngram_analyzer", searchAnalyzer = "ngram_analyzer")
        }
    )
    private String bizesNm; // 상호명

    @Field(type = FieldType.Keyword)
    private String indsLclsNm; // 대분류

    @Field(type = FieldType.Keyword)
    private String indsMclsNm; // 중분류

    @MultiField(
        mainField = @Field(type = FieldType.Text, analyzer = "korean_analyzer", searchAnalyzer = "korean_analyzer"),
        otherFields = {
            @InnerField(suffix = "ngram", type = FieldType.Text, analyzer = "ngram_analyzer", searchAnalyzer = "ngram_analyzer")
        }
    )
    private String indsSclsNm; // 소분류

    @Field(type = FieldType.Keyword)
    private String ctprvnNm; // 시도

    @Field(type = FieldType.Keyword)
    private String signguNm; // 시군구

    @Field(type = FieldType.Text, analyzer = "korean_analyzer", searchAnalyzer = "korean_analyzer")
    private String rdnmAdr; // 주소

    @Field(type = FieldType.Double)
    private Double lon;

    @Field(type = FieldType.Double)
    private Double lat;

    public static PlaceDocument from(PlaceMaster place) {
        return PlaceDocument.builder()
                .id(place.getId().toString())
                .bizesId(place.getBizesId())
                .bizesNm(place.getBizesNm())
                .indsLclsNm(place.getIndsLclsNm())
                .indsMclsNm(place.getIndsMclsNm())
                .indsSclsNm(place.getIndsSclsNm())
                .ctprvnNm(place.getCtprvnNm())
                .signguNm(place.getSignguNm())
                .rdnmAdr(place.getRdnmAdr())
                .lon(place.getLon())
                .lat(place.getLat())
                .build();
    }
}

package xyz.datt.domain.place.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "places")
public class Place {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String category;
    private String keyword;
    private String address;
    @Column(length = 2000) private String imageUrls;
    @Column(length = 1000) private String placeUrl;
    private Integer reviewCount;
    @Enumerated(EnumType.STRING) private Platform platform;

    public List<String> getImageUrlList() {
        if (this.imageUrls == null || this.imageUrls.isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.asList(this.imageUrls.split("\\|"));
    }
}
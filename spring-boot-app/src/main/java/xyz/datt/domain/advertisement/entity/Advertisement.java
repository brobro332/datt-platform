package xyz.datt.domain.advertisement.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import xyz.datt.global.entity.BaseEntity;

@Getter
@Entity
@Table(name = "advertisement")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Advertisement extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Column(nullable = false, length = 500)
    private String linkUrl;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @Builder
    private Advertisement(String title, String imageUrl, String linkUrl, String status) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.linkUrl = linkUrl;
        this.status = status != null ? status : "ACTIVE";
    }

    public void update(String title, String imageUrl, String linkUrl, String status) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.linkUrl = linkUrl;
        this.status = status;
    }
}

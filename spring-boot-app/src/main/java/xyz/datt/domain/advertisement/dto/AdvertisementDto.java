package xyz.datt.domain.advertisement.dto;

import jakarta.validation.constraints.NotBlank;
import xyz.datt.domain.advertisement.entity.Advertisement;

import java.time.LocalDateTime;

public class AdvertisementDto {

    public record AdCreateRequest(
            @NotBlank(message = "광고 제목은 필수입니다.")
            String title,

            @NotBlank(message = "광고 이미지 URL은 필수입니다.")
            String imageUrl,

            @NotBlank(message = "연결 링크 URL은 필수입니다.")
            String linkUrl
    ) {}

    public record AdResponse(
            Long id,
            String title,
            String imageUrl,
            String linkUrl,
            String status,
            LocalDateTime createdAt
    ) {
        public static AdResponse from(Advertisement ad) {
            return new AdResponse(
                    ad.getId(),
                    ad.getTitle(),
                    ad.getImageUrl(),
                    ad.getLinkUrl(),
                    ad.getStatus(),
                    ad.getCreatedAt()
            );
        }
    }
}

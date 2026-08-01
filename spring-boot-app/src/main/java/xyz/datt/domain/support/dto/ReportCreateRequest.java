package xyz.datt.domain.support.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ReportCreateRequest {
    private String targetType; // PLACE, REVIEW
    private Long targetId;
    private String reason;
}

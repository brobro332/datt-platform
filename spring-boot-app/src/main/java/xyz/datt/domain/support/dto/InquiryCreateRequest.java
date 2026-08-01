package xyz.datt.domain.support.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class InquiryCreateRequest {
    private String category; // IMPROVEMENT, STORE_REGISTRATION
    private String content;
}

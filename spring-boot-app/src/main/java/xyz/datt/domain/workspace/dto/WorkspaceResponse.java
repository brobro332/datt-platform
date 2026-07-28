package xyz.datt.domain.workspace.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceResponse {
    private Long id;
    private String name;
    private String inviteCode;
    private LocalDateTime createdAt;
}

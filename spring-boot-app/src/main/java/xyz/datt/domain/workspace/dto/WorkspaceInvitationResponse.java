package xyz.datt.domain.workspace.dto;

import lombok.Builder;
import lombok.Getter;
import xyz.datt.domain.workspace.entity.InvitationStatus;

import java.time.LocalDateTime;

@Getter
@Builder
public class WorkspaceInvitationResponse {
    private Long id;
    private Long workspaceId;
    private String workspaceName;
    private String senderUserId;
    private String receiverUserId;
    private InvitationStatus status;
    private LocalDateTime createdAt;
}

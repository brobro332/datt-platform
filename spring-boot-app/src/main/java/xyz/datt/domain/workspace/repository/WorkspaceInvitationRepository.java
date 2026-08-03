package xyz.datt.domain.workspace.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.datt.domain.workspace.entity.WorkspaceInvitation;
import xyz.datt.domain.workspace.entity.InvitationStatus;

import java.util.List;
import java.util.Optional;

public interface WorkspaceInvitationRepository extends JpaRepository<WorkspaceInvitation, Long> {
    List<WorkspaceInvitation> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId);
    List<WorkspaceInvitation> findByReceiverUserIdAndStatusOrderByCreatedAtDesc(String receiverUserId, InvitationStatus status);
    Optional<WorkspaceInvitation> findByWorkspaceIdAndReceiverUserIdAndStatus(Long workspaceId, String receiverUserId, InvitationStatus status);
}

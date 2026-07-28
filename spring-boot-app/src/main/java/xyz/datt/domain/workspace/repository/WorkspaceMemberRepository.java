package xyz.datt.domain.workspace.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import xyz.datt.domain.workspace.entity.WorkspaceMember;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {
    List<WorkspaceMember> findByUserId(String userId);
    List<WorkspaceMember> findByWorkspaceId(Long workspaceId);
    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(Long workspaceId, String userId);
}

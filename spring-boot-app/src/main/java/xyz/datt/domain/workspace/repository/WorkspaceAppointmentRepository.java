package xyz.datt.domain.workspace.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.datt.domain.workspace.entity.WorkspaceAppointment;

import java.util.List;

public interface WorkspaceAppointmentRepository extends JpaRepository<WorkspaceAppointment, Long> {
    List<WorkspaceAppointment> findByWorkspaceIdOrderByAppointmentTimeAsc(Long workspaceId);
}

package xyz.datt.domain.workspace.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.workspace.entity.WorkspaceAppointment;
import xyz.datt.domain.workspace.dto.WorkspaceAppointmentRequest;
import xyz.datt.domain.workspace.dto.WorkspaceAppointmentResponse;
import xyz.datt.domain.workspace.repository.WorkspaceAppointmentRepository;
import xyz.datt.domain.workspace.repository.WorkspaceRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkspaceAppointmentService {

    private final WorkspaceAppointmentRepository appointmentRepository;
    private final WorkspaceRepository workspaceRepository;

    @Transactional
    public WorkspaceAppointmentResponse createAppointment(Long workspaceId, WorkspaceAppointmentRequest request, Long memberId) {
        // Validate workspace exists
        workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        WorkspaceAppointment appointment = WorkspaceAppointment.builder()
                .workspaceId(workspaceId)
                .title(request.getTitle())
                .description(request.getDescription())
                .appointmentTime(request.getAppointmentTime())
                .location(request.getLocation())
                .creatorId(memberId)
                .createdAt(LocalDateTime.now())
                .build();

        WorkspaceAppointment saved = appointmentRepository.save(appointment);
        return WorkspaceAppointmentResponse.from(saved);
    }

    public List<WorkspaceAppointmentResponse> getAppointments(Long workspaceId) {
        return appointmentRepository.findByWorkspaceIdOrderByAppointmentTimeAsc(workspaceId)
                .stream()
                .map(WorkspaceAppointmentResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAppointment(Long workspaceId, Long appointmentId, Long memberId) {
        WorkspaceAppointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!appointment.getWorkspaceId().equals(workspaceId)) {
            throw new IllegalArgumentException("Invalid workspace ID");
        }

        // Only creator can delete for now
        if (!appointment.getCreatorId().equals(memberId)) {
            throw new IllegalArgumentException("No permission to delete");
        }

        appointmentRepository.delete(appointment);
    }
}

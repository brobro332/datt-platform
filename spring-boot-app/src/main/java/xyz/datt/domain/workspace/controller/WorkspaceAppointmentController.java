package xyz.datt.domain.workspace.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.datt.domain.workspace.dto.WorkspaceAppointmentRequest;
import xyz.datt.domain.workspace.dto.WorkspaceAppointmentResponse;
import xyz.datt.domain.workspace.service.WorkspaceAppointmentService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wave/workspaces/{workspaceId}/appointments")
public class WorkspaceAppointmentController {

    private final WorkspaceAppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<WorkspaceAppointmentResponse> createAppointment(
            @PathVariable Long workspaceId,
            @RequestBody WorkspaceAppointmentRequest request,
            @RequestHeader("X-Member-Id") Long memberId) {
        return ResponseEntity.ok(appointmentService.createAppointment(workspaceId, request, memberId));
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceAppointmentResponse>> getAppointments(
            @PathVariable Long workspaceId) {
        return ResponseEntity.ok(appointmentService.getAppointments(workspaceId));
    }

    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<Void> deleteAppointment(
            @PathVariable Long workspaceId,
            @PathVariable Long appointmentId,
            @RequestHeader("X-Member-Id") Long memberId) {
        appointmentService.deleteAppointment(workspaceId, appointmentId, memberId);
        return ResponseEntity.ok().build();
    }
}

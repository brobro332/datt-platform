package xyz.datt.domain.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.datt.domain.admin.entity.AdminActivityLog;

public interface AdminActivityLogRepository extends JpaRepository<AdminActivityLog, Long> {
}

package xyz.datt.domain.support.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import xyz.datt.domain.support.entity.Report;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Page<Report> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

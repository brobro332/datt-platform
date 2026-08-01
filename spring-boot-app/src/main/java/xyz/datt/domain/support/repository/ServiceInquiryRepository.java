package xyz.datt.domain.support.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import xyz.datt.domain.support.entity.ServiceInquiry;

@Repository
public interface ServiceInquiryRepository extends JpaRepository<ServiceInquiry, Long> {
    Page<ServiceInquiry> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<ServiceInquiry> findAllByAuthorIdOrderByCreatedAtDesc(String authorId, Pageable pageable);
}

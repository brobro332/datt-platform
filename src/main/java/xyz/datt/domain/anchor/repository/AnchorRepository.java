package xyz.datt.domain.anchor.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import xyz.datt.domain.anchor.entity.Anchor;

public interface AnchorRepository extends JpaRepository<Anchor, Long> {
    Page<Anchor> findByIsPublicTrueOrderByCreatedAtDesc(Pageable pageable);
    Page<Anchor> findByIsPublicTrueOrderByViewCountDesc(Pageable pageable);
    Page<Anchor> findByMemberIdOrderByCreatedAtDesc(Long memberId, Pageable pageable);
    Page<Anchor> findByMemberIdOrderByViewCountDesc(Long memberId, Pageable pageable);
}
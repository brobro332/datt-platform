package xyz.datt.domain.anchor.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.datt.domain.anchor.entity.AnchorLike;

import java.util.Optional;

public interface AnchorLikeRepository extends JpaRepository<AnchorLike, Long> {
    boolean existsByMemberIdAndAnchorId(Long memberId, Long anchorId);
    Optional<AnchorLike> findByMemberIdAndAnchorId(Long memberId, Long anchorId);
    int countByAnchorId(Long anchorId);
}
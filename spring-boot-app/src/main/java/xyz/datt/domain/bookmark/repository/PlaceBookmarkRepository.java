package xyz.datt.domain.bookmark.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import xyz.datt.domain.bookmark.entity.PlaceBookmark;

import java.util.Optional;

public interface PlaceBookmarkRepository extends JpaRepository<PlaceBookmark, Long> {
    boolean existsByMemberIdAndPlaceMasterId(Long memberId, Long placeId);
    Optional<PlaceBookmark> findByMemberIdAndPlaceMasterId(Long memberId, Long placeId);
    Page<PlaceBookmark> findByMemberIdOrderByCreatedAtDesc(Long memberId, Pageable pageable);
    long countByMemberId(Long memberId);
    void deleteByMemberId(Long memberId);

    @Query("select pb from PlaceBookmark pb join pb.bookmarkFolders bf where pb.member.id = :memberId and bf.id = :folderId order by pb.createdAt desc")
    Page<PlaceBookmark> findByMemberIdAndFolderId(
        @Param("memberId") Long memberId,
        @Param("folderId") Long folderId,
        Pageable pageable
    );

    @Query("select pb from PlaceBookmark pb join pb.bookmarkFolders bf where bf.id = :folderId order by pb.createdAt desc")
    java.util.List<PlaceBookmark> findByFolderId(@Param("folderId") Long folderId);
}
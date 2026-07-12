package xyz.datt.domain.bookmark.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.datt.domain.bookmark.entity.BookmarkFolder;

import java.util.List;
import java.util.Optional;

public interface BookmarkFolderRepository extends JpaRepository<BookmarkFolder, Long> {
    List<BookmarkFolder> findByMemberIdOrderByNameAsc(Long memberId);
    Optional<BookmarkFolder> findByIdAndMemberId(Long id, Long memberId);
    boolean existsByMemberIdAndName(Long memberId, String name);
}

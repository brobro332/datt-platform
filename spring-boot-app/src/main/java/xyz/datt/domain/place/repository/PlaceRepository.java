package xyz.datt.domain.place.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.place.entity.Place;
import xyz.datt.domain.place.entity.Platform;

import java.util.List;

public interface PlaceRepository extends JpaRepository<Place, Long> {
    List<Place> findByKeywordAndCategoryAndPlatform(String keyword, String category, Platform platform);

    @Modifying
    @Transactional
    @Query("""
        DELETE FROM Place p
        WHERE p.keyword = :keyword
        AND p.category = :category
        AND p.platform = :platform
    """)
    void deleteOldData(@Param("keyword") String keyword, @Param("category") String category, @Param("platform") Platform platform);
}

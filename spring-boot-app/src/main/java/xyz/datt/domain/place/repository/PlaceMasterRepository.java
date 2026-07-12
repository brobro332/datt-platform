package xyz.datt.domain.place.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import xyz.datt.domain.place.dto.PlaceNearbyResponse;
import xyz.datt.domain.place.entity.PlaceMaster;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PlaceMasterRepository extends JpaRepository<PlaceMaster, Long>, PlaceQueryRepository {
    boolean existsByBizesId(String bizesId);
    Optional<PlaceMaster> findByBizesId(String bizesId);
    Slice<PlaceMaster> findByBizesNmContaining(String keyword, Pageable pageable);
    Slice<PlaceMaster> findByCtprvnNmAndSignguNm(String ctprvnNm, String signguNm, Pageable pageable);
    Slice<PlaceMaster> findByCtprvnNmAndSignguNmAndBizesNmContaining(String ctprvnNm, String signguNm, String bizesNm, Pageable pageable);
    List<PlaceMaster> findByIndsLclsNm(String indsLclsNm);
    List<PlaceMaster> findByIndsMclsNm(String indsMclsNm);
    List<PlaceMaster> findByIndsSclsNm(String indsSclsNm);

    @Query("select p.bizesId from PlaceMaster p where p.bizesId in :bizesIds")
    List<String> findBizesIdsByBizesIdIn(@Param("bizesIds") Collection<String> bizesIds);
}
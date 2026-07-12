package xyz.datt.domain.place.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.datt.domain.place.entity.SubwayStation;

import java.util.List;
import java.util.Optional;

public interface SubwayStationRepository extends JpaRepository<SubwayStation, Long> {
    Optional<SubwayStation> findByNameAndLine(String name, String line);
    List<SubwayStation> findByProvinceAndDistrict(String province, String district);
}

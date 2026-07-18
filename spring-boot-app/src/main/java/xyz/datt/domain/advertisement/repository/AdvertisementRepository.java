package xyz.datt.domain.advertisement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.datt.domain.advertisement.entity.Advertisement;

import java.util.List;

public interface AdvertisementRepository extends JpaRepository<Advertisement, Long> {
    List<Advertisement> findAllByStatusOrderByIdDesc(String status);
    List<Advertisement> findAllByOrderByIdDesc();
}

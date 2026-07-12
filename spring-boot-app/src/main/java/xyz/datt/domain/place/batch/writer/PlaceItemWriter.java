package xyz.datt.domain.place.batch.writer;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.infrastructure.item.Chunk;
import org.springframework.batch.infrastructure.item.ItemWriter;
import xyz.datt.domain.place.entity.PlaceMaster;
import xyz.datt.domain.place.repository.PlaceMasterRepository;

import java.util.List;

@RequiredArgsConstructor
public class PlaceItemWriter implements ItemWriter<PlaceMaster> {
    private final PlaceMasterRepository placeMasterRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public void write(Chunk<? extends PlaceMaster> chunk) {
        List<String> bizesIds = chunk.getItems().stream()
            .map(PlaceMaster::getBizesId)
            .toList();

        List<String> existingBizesIds = placeMasterRepository.findBizesIdsByBizesIdIn(bizesIds);

        List<? extends PlaceMaster> newPlaces = chunk.getItems().stream()
            .filter(item -> !existingBizesIds.contains(item.getBizesId()))
            .toList();

        if (!newPlaces.isEmpty()) {
            placeMasterRepository.saveAll(newPlaces);
        }

        if (entityManager != null) {
            entityManager.clear();
        }
    }
}
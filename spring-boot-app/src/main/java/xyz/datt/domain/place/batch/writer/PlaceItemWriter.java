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

        List<PlaceMaster> existingPlaces = placeMasterRepository.findByBizesIdIn(bizesIds);
        java.util.Map<String, PlaceMaster> existingPlacesMap = existingPlaces.stream()
            .collect(java.util.stream.Collectors.toMap(PlaceMaster::getBizesId, p -> p));

        List<PlaceMaster> toSave = new java.util.ArrayList<>();

        for (PlaceMaster incoming : chunk.getItems()) {
            PlaceMaster existing = existingPlacesMap.get(incoming.getBizesId());
            if (existing != null) {
                existing.updateFrom(incoming);
                toSave.add(existing);
            } else {
                toSave.add(incoming);
            }
        }

        if (!toSave.isEmpty()) {
            placeMasterRepository.saveAll(toSave);
        }

        if (entityManager != null) {
            entityManager.clear();
        }
    }
}
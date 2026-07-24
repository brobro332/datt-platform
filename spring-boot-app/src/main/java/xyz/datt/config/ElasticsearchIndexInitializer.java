package xyz.datt.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import xyz.datt.domain.place.entity.PlaceDocument;
import xyz.datt.domain.place.entity.PlaceMaster;
import xyz.datt.domain.place.repository.PlaceElasticsearchRepository;
import xyz.datt.domain.place.repository.PlaceMasterRepository;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ElasticsearchIndexInitializer {

    private final ElasticsearchOperations elasticsearchOperations;
    private final PlaceMasterRepository placeMasterRepository;
    private final PlaceElasticsearchRepository placeElasticsearchRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeIndices() {
        try {
            IndexOperations indexOps = elasticsearchOperations.indexOps(PlaceDocument.class);
            
            log.info("Deleting existing 'places' index for applying new custom Ngram mapping...");
            try {
                indexOps.delete();
            } catch (Exception ignore) {}

            log.info("Creating Elasticsearch 'places' index with custom settings (Ngram & Nori)...");
            indexOps.create();
            indexOps.putMapping(indexOps.createMapping(PlaceDocument.class));
            log.info("Successfully created new 'places' index. Ready for manual migration.");

        } catch (Exception e) {
            log.error("Failed to initialize Elasticsearch 'places' index", e);
        }
    }
}

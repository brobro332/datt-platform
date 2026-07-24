package xyz.datt.config;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.stereotype.Component;
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
    private final EntityManager entityManager;

    @EventListener(ApplicationReadyEvent.class)
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
            log.info("Successfully created new 'places' index. Starting background automatic full migration...");

            // Asynchronously migrate ALL 2.7 million records in the background without causing OOM
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                try {
                    Thread.sleep(3000); // Wait 3 seconds for boot stabilization
                    log.info("Starting background FULL migration of 2,725,322 places to Elasticsearch...");
                    long totalCount = placeMasterRepository.count();
                    int pageSize = 2000;
                    int totalPages = (int) Math.ceil((double) totalCount / pageSize);
                    log.info("Total places to migrate: {}. Total pages: {}", totalCount, totalPages);

                    long migratedCount = 0;
                    for (int i = 0; i < totalPages; i++) {
                        List<PlaceMaster> chunk = placeMasterRepository.findAll(PageRequest.of(i, pageSize)).getContent();
                        if (!chunk.isEmpty()) {
                            List<PlaceDocument> docs = chunk.stream()
                                    .map(PlaceDocument::from)
                                    .toList();
                            placeElasticsearchRepository.saveAll(docs);
                            migratedCount += docs.size();
                            
                            // [Crucial optimization] Clear Hibernate persistence context to prevent heap OOM
                            entityManager.clear();
                            
                            if ((i + 1) % 10 == 0 || (i + 1) == totalPages) {
                                log.info("Background Full Migration Progress: {}/{} pages ({} / {} docs migrated)", 
                                        i + 1, totalPages, migratedCount, totalCount);
                            }
                        }
                    }
                    log.info("Successfully finished FULL background migration. Total migrated={}", migratedCount);
                } catch (Exception e) {
                    log.error("Failed to run FULL background place migration", e);
                }
            });

        } catch (Exception e) {
            log.error("Failed to initialize Elasticsearch 'places' index", e);
        }
    }
}

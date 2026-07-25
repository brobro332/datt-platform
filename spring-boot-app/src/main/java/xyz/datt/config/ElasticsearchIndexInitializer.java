package xyz.datt.config;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import xyz.datt.domain.place.entity.PlaceDocument;
import xyz.datt.domain.place.entity.PlaceMaster;
import xyz.datt.domain.place.repository.PlaceMasterRepository;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ElasticsearchIndexInitializer {

    private final ElasticsearchClient elasticsearchClient;
    private final PlaceMasterRepository placeMasterRepository;
    private final EntityManager entityManager;

    @EventListener(ApplicationReadyEvent.class)
    public void initializeIndices() {
        try {
            boolean indexCreated = false;
            try {
                log.info("Attempting to create Elasticsearch 'places' index...");
                // Native indices create
                elasticsearchClient.indices().create(c -> c.index("places"));
                log.info("Successfully created new 'places' index.");
                indexCreated = true;
            } catch (Exception e) {
                String rootMsg = e.toString();
                if (rootMsg.contains("resource_already_exists_exception") || rootMsg.contains("alreadyexists") || rootMsg.contains("already exists")) {
                    log.info("Elasticsearch 'places' index already exists. Skipping creation.");
                } else {
                    log.error("Failed to create index but proceeding, error: " + e.getMessage());
                }
            }

            if (indexCreated) {
                log.info("Starting background automatic full migration...");

                // Asynchronously migrate ALL 2.7 million records in the background only when index is newly created
                java.util.concurrent.CompletableFuture.runAsync(() -> {
                    try {
                        Thread.sleep(3000); // Wait 3 seconds for boot stabilization
                        log.info("Starting background FULL migration of 2,725,322 places to Elasticsearch...");
                        long totalCount = placeMasterRepository.count();
                        int pageSize = 2000;
                        log.info("Total places to migrate: {}", totalCount);

                        long migratedCount = 0;
                        Long lastId = 0L;

                        while (migratedCount < totalCount) {
                            int currentBatchSize = Math.min(pageSize, (int) (totalCount - migratedCount));
                            if (currentBatchSize <= 0) {
                                break;
                            }

                            List<PlaceMaster> chunk = placeMasterRepository.findByIdGreaterThanOrderByIdAsc(
                                    lastId, PageRequest.of(0, currentBatchSize)
                            );

                            if (chunk.isEmpty()) {
                                break;
                            }

                            List<PlaceDocument> docs = chunk.stream()
                                    .map(PlaceDocument::from)
                                    .toList();

                            // Native bulk indexing
                            co.elastic.clients.elasticsearch.core.BulkRequest.Builder br = new co.elastic.clients.elasticsearch.core.BulkRequest.Builder();
                            for (PlaceDocument doc : docs) {
                                br.operations(op -> op
                                    .index(idx -> idx
                                        .index("places")
                                        .id(doc.getId())
                                        .document(doc)
                                    )
                                );
                            }
                            co.elastic.clients.elasticsearch.core.BulkResponse result = elasticsearchClient.bulk(br.build());
                            if (result.errors()) {
                                log.error("Background Bulk index execution reported errors");
                            }

                            migratedCount += docs.size();
                            lastId = chunk.get(chunk.size() - 1).getId();

                            // Clear Hibernate persistence context to prevent heap OOM
                            entityManager.clear();

                            if (migratedCount % 20000 == 0 || migratedCount >= totalCount) {
                                log.info("Background Full Migration Progress: {} / {} docs migrated", 
                                        migratedCount, totalCount);
                            }
                        }
                        log.info("Successfully finished FULL background migration. Total migrated={}", migratedCount);
                    } catch (Exception ex) {
                        log.error("Failed to run FULL background place migration", ex);
                    }
                });
            }
        } catch (Exception e) {
            log.error("Failed to initialize Elasticsearch indices", e);
        }
    }
}

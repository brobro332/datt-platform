package xyz.datt.domain.place.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import org.springframework.stereotype.Service;
import xyz.datt.domain.place.dto.PlaceSearchCondition;
import xyz.datt.domain.place.dto.PlaceSearchResponse;
import xyz.datt.domain.place.entity.PlaceDocument;
import xyz.datt.domain.place.repository.PlaceMasterRepository;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlaceSearchService {
    private final PlaceMasterRepository placeMasterRepository;
    private final ElasticsearchClient elasticsearchClient;
    private final xyz.datt.domain.place.repository.PlaceElasticsearchRepository placeElasticsearchRepository;
    private final jakarta.persistence.EntityManager entityManager;

    private List<String> expandKeywords(String keyword) {
        List<String> keywords = new java.util.ArrayList<>();
        keywords.add(keyword);

        if (keyword.contains("댓")) {
            String alt = keyword.replace("댓", "대");
            keywords.add(alt);
            if (alt.endsWith("국")) {
                keywords.add(alt.substring(0, alt.length() - 1));
            }
        }
        if (keyword.contains("둣")) {
            String alt = keyword.replace("둣", "두");
            keywords.add(alt);
            if (alt.endsWith("국")) {
                keywords.add(alt.substring(0, alt.length() - 1));
            }
        }
        if (keyword.contains("대국")) {
            keywords.add(keyword.replace("대국", "댓국"));
        }
        if (keyword.contains("두국")) {
            keywords.add(keyword.replace("두국", "둣국"));
        }
        if (keyword.equals("순대")) {
            keywords.add("순댓국");
            keywords.add("순대국");
        }

        return keywords.stream().distinct().toList();
    }

    public Page<PlaceSearchResponse> searchPlaces(
        PlaceSearchCondition condition,
        Pageable pageable
    ) {
        if (condition.getKeyword() != null && !condition.getKeyword().isBlank()) {
            try {
                log.info("Searching places using Elasticsearch: keyword={}, ctprvn={}, signgu={}",
                        condition.getKeyword(), condition.getCtprvnNm(), condition.getSignguNm());

                List<String> searchTerms = expandKeywords(condition.getKeyword());
                log.info("Expanded search terms for query: {}", searchTerms);

                // Build should queries for keywords
                java.util.List<Query> shouldQueries = new java.util.ArrayList<>();
                for (String term : searchTerms) {
                    shouldQueries.add(Query.of(q -> q.match(m -> m.field("bizesNm").query(term).boost(10.0f))));
                    shouldQueries.add(Query.of(q -> q.match(m -> m.field("bizesNm.ngram").query(term).boost(0.1f))));
                    shouldQueries.add(Query.of(q -> q.match(m -> m.field("indsSclsNm").query(term).boost(5.0f))));
                    shouldQueries.add(Query.of(q -> q.match(m -> m.field("indsSclsNm.ngram").query(term).boost(0.05f))));
                    shouldQueries.add(Query.of(q -> q.match(m -> m.field("rdnmAdr").query(term).boost(1.0f))));
                }

                // Build must queries (combining keyword shoulds + location constraints)
                java.util.List<Query> mustQueries = new java.util.ArrayList<>();
                mustQueries.add(Query.of(q -> q.bool(b -> b.should(shouldQueries).minimumShouldMatch("1"))));

                if (condition.getCtprvnNm() != null && !condition.getCtprvnNm().isBlank()) {
                    mustQueries.add(Query.of(q -> q.term(t -> t.field("ctprvnNm").value(condition.getCtprvnNm()))));
                }
                if (condition.getSignguNm() != null && !condition.getSignguNm().isBlank()) {
                    mustQueries.add(Query.of(q -> q.term(t -> t.field("signguNm").value(condition.getSignguNm()))));
                }

                int from = (int) pageable.getOffset();
                int size = pageable.getPageSize();

                co.elastic.clients.elasticsearch.core.SearchRequest searchRequest = co.elastic.clients.elasticsearch.core.SearchRequest.of(s -> s
                        .index("places")
                        .query(q -> q.bool(b -> b.must(mustQueries)))
                        .from(from)
                        .size(size)
                );

                co.elastic.clients.elasticsearch.core.SearchResponse<PlaceDocument> searchResponse =
                        elasticsearchClient.search(searchRequest, PlaceDocument.class);

                List<PlaceSearchResponse> list = searchResponse.hits().hits().stream()
                        .map(hit -> PlaceSearchResponse.from(hit.source()))
                        .toList();

                long totalHits = searchResponse.hits().total() != null ? searchResponse.hits().total().value() : 0L;
                return new PageImpl<>(list, pageable, totalHits);
            } catch (Exception e) {
                log.error("Elasticsearch search failed, falling back to PostgreSQL RDBMS search", e);
            }
        }

        log.info("Searching places using PostgreSQL RDBMS: keyword={}, ctprvn={}, signgu={}",
                condition.getKeyword(), condition.getCtprvnNm(), condition.getSignguNm());
        return placeMasterRepository.searchPlaces(condition, pageable);
     }

    public long migratePlaces(int limit) {
        log.info("Starting manual place migration up to limit={}", limit);
        long totalCount = placeMasterRepository.count();
        int pageSize = 1000;
        int targetCount = Math.min(limit, (int) totalCount);

        long migratedCount = 0;
        Long lastId = 0L;

        while (migratedCount < targetCount) {
            int currentBatchSize = Math.min(pageSize, (int) (targetCount - migratedCount));
            if (currentBatchSize <= 0) {
                break;
            }

            List<xyz.datt.domain.place.entity.PlaceMaster> chunk = placeMasterRepository.findByIdGreaterThanOrderByIdAsc(
                    lastId, org.springframework.data.domain.PageRequest.of(0, currentBatchSize)
            );

            if (chunk.isEmpty()) {
                break;
            }

            List<PlaceDocument> docs = chunk.stream()
                    .map(PlaceDocument::from)
                    .toList();

            try {
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
                    log.error("Bulk index execution reported errors");
                }
            } catch (Exception e) {
                log.error("Native bulk indexing failed", e);
                throw new RuntimeException("Native bulk indexing failed", e);
            }

            migratedCount += docs.size();

            // Record last ID for the next keyset page
            lastId = chunk.get(chunk.size() - 1).getId();

            // Clear 1st-level cache of JPA to prevent OOM
            entityManager.clear();

            if (migratedCount % 10000 == 0 || migratedCount >= targetCount) {
                log.info("Manual place migration progress: {} / {} docs migrated", migratedCount, targetCount);
            }
        }
        log.info("Finished manual place migration. Total migrated count={}", migratedCount);
        return migratedCount;
    }
}
package xyz.datt.domain.place.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
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
    private final ElasticsearchOperations elasticsearchOperations;

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

                Criteria criteria = null;
                for (String term : searchTerms) {
                    Criteria termCriteria = new Criteria("bizesNm").is(term)
                            .or(new Criteria("bizesNm.ngram").is(term))
                            .or(new Criteria("indsSclsNm").is(term))
                            .or(new Criteria("indsSclsNm.ngram").is(term))
                            .or(new Criteria("rdnmAdr").is(term));
                    
                    if (criteria == null) {
                        criteria = termCriteria;
                    } else {
                        criteria = criteria.or(termCriteria);
                    }
                }

                if (condition.getCtprvnNm() != null && !condition.getCtprvnNm().isBlank()) {
                    criteria = criteria.and(new Criteria("ctprvnNm").is(condition.getCtprvnNm()));
                }
                if (condition.getSignguNm() != null && !condition.getSignguNm().isBlank()) {
                    criteria = criteria.and(new Criteria("signguNm").is(condition.getSignguNm()));
                }

                CriteriaQuery query = new CriteriaQuery(criteria, pageable);
                SearchHits<PlaceDocument> searchHits = elasticsearchOperations.search(query, PlaceDocument.class);

                List<PlaceSearchResponse> list = searchHits.stream()
                        .map(hit -> PlaceSearchResponse.from(hit.getContent()))
                        .toList();

                return new PageImpl<>(list, pageable, searchHits.getTotalHits());
            } catch (Exception e) {
                log.error("Elasticsearch search failed, falling back to PostgreSQL RDBMS search", e);
            }
        }

        log.info("Searching places using PostgreSQL RDBMS: keyword={}, ctprvn={}, signgu={}",
                condition.getKeyword(), condition.getCtprvnNm(), condition.getSignguNm());
        return placeMasterRepository.searchPlaces(condition, pageable);
    }
}
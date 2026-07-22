package xyz.datt.domain.place.repository;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import xyz.datt.domain.place.entity.PlaceDocument;

public interface PlaceElasticsearchRepository extends ElasticsearchRepository<PlaceDocument, String> {
}

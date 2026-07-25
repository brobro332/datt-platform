package xyz.datt.domain.place.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import xyz.datt.domain.place.entity.PlaceDocument;
import xyz.datt.domain.place.repository.PlaceElasticsearchRepository;

import java.util.Map;

@Slf4j
@Service
public class PlaceKafkaConsumer {

    private final PlaceElasticsearchRepository placeElasticsearchRepository;
    private final ObjectMapper objectMapper;

    public PlaceKafkaConsumer(PlaceElasticsearchRepository placeElasticsearchRepository) {
        this.placeElasticsearchRepository = placeElasticsearchRepository;
        this.objectMapper = new ObjectMapper();
    }

    @KafkaListener(topics = "place-events", groupId = "datt-es-group")
    public void consumePlaceEvent(Map<String, Object> message) {
        try {
            log.info("Received place event from Kafka map: {}", message);
            String eventType = (String) message.get("eventType");
            
            Object placeIdObj = message.get("placeId");
            String placeId = placeIdObj != null ? String.valueOf(placeIdObj) : null;

            log.info("Received place event from Kafka: type={}, id={}", eventType, placeId);

            if ("DELETE".equals(eventType)) {
                if (placeId != null) {
                    placeElasticsearchRepository.deleteById(placeId);
                    log.info("Deleted place from ES index: id={}", placeId);
                }
            } else {
                Map<?, ?> placeMap = (Map<?, ?>) message.get("place");
                if (placeMap != null) {
                    PlaceDocument placeDoc = objectMapper.convertValue(placeMap, PlaceDocument.class);
                    placeElasticsearchRepository.save(placeDoc);
                    log.info("Indexed place to ES index: name={}, id={}", placeDoc.getBizesNm(), placeId);
                }
            }
        } catch (Exception e) {
            log.error("Failed to process place event and index to Elasticsearch", e);
        }
    }
}

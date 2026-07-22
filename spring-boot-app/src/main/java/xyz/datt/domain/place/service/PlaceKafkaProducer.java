package xyz.datt.domain.place.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import xyz.datt.domain.place.entity.PlaceEvent;
import xyz.datt.domain.place.entity.PlaceDocument;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlaceKafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePlaceEvent(PlaceEvent event) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("eventType", event.getEventType());
            message.put("placeId", event.getPlace().getId().toString());
            
            if (!"DELETE".equals(event.getEventType())) {
                message.put("place", PlaceDocument.from(event.getPlace()));
            }

            kafkaTemplate.send("place-events", event.getPlace().getId().toString(), message);
            log.info("Sent place event to Kafka: type={}, id={}", event.getEventType(), event.getPlace().getId());
        } catch (Exception e) {
            log.error("Failed to send place event to Kafka", e);
        }
    }
}

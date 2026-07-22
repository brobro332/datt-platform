package xyz.datt.domain.place.entity;

import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class PlaceMasterEntityListener {

    private static ApplicationEventPublisher eventPublisher;

    @Autowired
    public void init(ApplicationEventPublisher eventPublisher) {
        PlaceMasterEntityListener.eventPublisher = eventPublisher;
    }

    @PostPersist
    public void onPostPersist(PlaceMaster place) {
        if (eventPublisher != null) {
            eventPublisher.publishEvent(new PlaceEvent(place, "INSERT"));
        }
    }

    @PostUpdate
    public void onPostUpdate(PlaceMaster place) {
        if (eventPublisher != null) {
            eventPublisher.publishEvent(new PlaceEvent(place, "UPDATE"));
        }
    }

    @PostRemove
    public void onPostRemove(PlaceMaster place) {
        if (eventPublisher != null) {
            eventPublisher.publishEvent(new PlaceEvent(place, "DELETE"));
        }
    }
}

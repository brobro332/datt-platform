package xyz.datt.domain.place.entity;

import lombok.Getter;

@Getter
public class PlaceEvent {
    private final PlaceMaster place;
    private final String eventType; // INSERT, UPDATE, DELETE

    public PlaceEvent(PlaceMaster place, String eventType) {
        this.place = place;
        this.eventType = eventType;
    }
}

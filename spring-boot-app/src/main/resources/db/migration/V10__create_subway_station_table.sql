CREATE TABLE subway_station (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    line VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subway_station_region ON subway_station(province, district);

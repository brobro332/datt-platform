CREATE TABLE push_subscription (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    endpoint VARCHAR(1000) NOT NULL,
    p256dh VARCHAR(255) NOT NULL,
    auth VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

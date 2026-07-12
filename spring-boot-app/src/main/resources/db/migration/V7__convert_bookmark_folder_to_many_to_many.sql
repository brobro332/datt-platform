-- 북마크와 폴더 간의 다대다 매핑 테이블 (어느 폴더에 담겼는지 관리)
CREATE TABLE bookmark_folder_places (
                                        bookmark_id BIGINT NOT NULL,
                                        folder_id BIGINT NOT NULL,
                                        PRIMARY KEY (bookmark_id, folder_id),
                                        CONSTRAINT fk_folder_places_bookmark FOREIGN KEY (bookmark_id) REFERENCES place_bookmarks (id) ON DELETE CASCADE,
                                        CONSTRAINT fk_folder_places_folder FOREIGN KEY (folder_id) REFERENCES bookmark_folders (id) ON DELETE CASCADE
);

COMMENT ON TABLE bookmark_folder_places IS '북마크 폴더별 장소 매핑 테이블';
COMMENT ON COLUMN bookmark_folder_places.bookmark_id IS '북마크 PK';
COMMENT ON COLUMN bookmark_folder_places.folder_id IS '북마크 폴더 PK';

CREATE INDEX idx_folder_places_bookmark_id ON bookmark_folder_places (bookmark_id);
CREATE INDEX idx_folder_places_folder_id ON bookmark_folder_places (folder_id);

-- 기존 단일 폴더 매핑 데이터가 존재할 경우 다대다 조인 테이블로 마이그레이션 이관
INSERT INTO bookmark_folder_places (bookmark_id, folder_id)
SELECT id, folder_id FROM place_bookmarks WHERE folder_id IS NOT NULL;

-- place_bookmarks 테이블에서 단일 folder_id 컬럼 및 관련 인덱스/제약조건 제거
ALTER TABLE place_bookmarks DROP CONSTRAINT fk_place_bookmarks_folder;
ALTER TABLE place_bookmarks DROP COLUMN folder_id;
DROP INDEX IF EXISTS idx_place_bookmarks_folder_id;

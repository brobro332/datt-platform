CREATE TABLE bookmark_folders (
                                  id BIGSERIAL PRIMARY KEY,
                                  member_id BIGINT NOT NULL,
                                  name VARCHAR(50) NOT NULL,
                                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                  CONSTRAINT uk_bookmark_folders_member_name UNIQUE (member_id, name),
                                  CONSTRAINT fk_bookmark_folders_member FOREIGN KEY (member_id) REFERENCES member (id)
);

COMMENT ON TABLE bookmark_folders IS '북마크 폴더 테이블';
COMMENT ON COLUMN bookmark_folders.id IS '북마크 폴더 PK';
COMMENT ON COLUMN bookmark_folders.member_id IS '회원 PK';
COMMENT ON COLUMN bookmark_folders.name IS '폴더 이름';
COMMENT ON COLUMN bookmark_folders.created_at IS '생성일시';
COMMENT ON COLUMN bookmark_folders.updated_at IS '수정일시';

-- place_bookmarks 테이블에 folder_id 컬럼 추가 및 FK 연동 (폴더 삭제시 북마크는 유지하되 folder_id는 NULL로 변경)
ALTER TABLE place_bookmarks ADD COLUMN folder_id BIGINT;
ALTER TABLE place_bookmarks ADD CONSTRAINT fk_place_bookmarks_folder FOREIGN KEY (folder_id) REFERENCES bookmark_folders (id) ON DELETE SET NULL;
COMMENT ON COLUMN place_bookmarks.folder_id IS '북마크 폴더 PK (NULL 가능)';

CREATE INDEX idx_bookmark_folders_member_id ON bookmark_folders (member_id);
CREATE INDEX idx_place_bookmarks_folder_id ON place_bookmarks (folder_id);

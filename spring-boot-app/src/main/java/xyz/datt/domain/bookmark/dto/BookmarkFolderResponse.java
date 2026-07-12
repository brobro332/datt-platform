package xyz.datt.domain.bookmark.dto;

import xyz.datt.domain.bookmark.entity.BookmarkFolder;

public record BookmarkFolderResponse(
    Long id,
    String name
) {
    public static BookmarkFolderResponse from(BookmarkFolder folder) {
        if (folder == null) {
            return null;
        }
        return new BookmarkFolderResponse(folder.getId(), folder.getName());
    }
}

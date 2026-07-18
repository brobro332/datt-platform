package xyz.datt.domain.bookmark.dto;

import java.util.List;

public record PublicBookmarkFolderResponse(
    Long folderId,
    String folderName,
    String ownerNickname,
    List<PlaceBookmarkResponse> bookmarks
) {}

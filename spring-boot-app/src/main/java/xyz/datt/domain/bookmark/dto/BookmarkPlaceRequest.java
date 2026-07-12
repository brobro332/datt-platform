package xyz.datt.domain.bookmark.dto;

import java.util.List;

public record BookmarkPlaceRequest(
    List<Long> folderIds
) {}

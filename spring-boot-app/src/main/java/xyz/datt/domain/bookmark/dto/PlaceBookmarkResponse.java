package xyz.datt.domain.bookmark.dto;

import xyz.datt.domain.bookmark.entity.PlaceBookmark;

import java.time.LocalDateTime;
import java.util.List;

public record PlaceBookmarkResponse(
    Long bookmarkId,
    Long placeId,

    String bizesNm,
    String brchNm,

    String indsMclsCd,
    String indsMclsNm,

    String ctprvnNm,
    String signguNm,
    String adongNm,

    String rdnmAdr,

    Double lon,
    Double lat,

    LocalDateTime bookmarkedAt,
    List<BookmarkFolderResponse> folders
) {

    public static PlaceBookmarkResponse from(PlaceBookmark placeBookmark) {
        return new PlaceBookmarkResponse(
            placeBookmark.getId(),
            placeBookmark.getPlaceMaster().getId(),

            placeBookmark.getPlaceMaster().getBizesNm(),
            placeBookmark.getPlaceMaster().getBrchNm(),

            placeBookmark.getPlaceMaster().getIndsMclsCd(),
            placeBookmark.getPlaceMaster().getIndsMclsNm(),

            placeBookmark.getPlaceMaster().getCtprvnNm(),
            placeBookmark.getPlaceMaster().getSignguNm(),
            placeBookmark.getPlaceMaster().getAdongNm(),

            placeBookmark.getPlaceMaster().getRdnmAdr(),

            placeBookmark.getPlaceMaster().getLon(),
            placeBookmark.getPlaceMaster().getLat(),

            placeBookmark.getCreatedAt(),
            placeBookmark.getBookmarkFolders() != null ? placeBookmark.getBookmarkFolders().stream()
                .map(BookmarkFolderResponse::from)
                .toList() : List.of()
        );
    }
}
export type PlaceBookmarkResponse = {
  bookmarkId: number;
  placeId: number;

  bizesNm: string;
  brchNm: string | null;

  indsMclsCd: string;
  indsMclsNm: string;

  ctprvnNm: string;
  signguNm: string;
  adongNm: string;

  rdnmAdr: string;

  lon: number;
  lat: number;

  bookmarkedAt: string;
  folders?: BookmarkFolder[];
};

export type BookmarkFolder = {
  id: number;
  name: string;
};

export type BookmarkFolderRequest = {
  name: string;
};

export type PublicBookmarkFolderResponse = {
  folderId: number;
  folderName: string;
  ownerNickname: string;
  bookmarks: PlaceBookmarkResponse[];
};
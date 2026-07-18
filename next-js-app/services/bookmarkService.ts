import { apiClient } from "@/lib/apiClient";
import type { ApiResponse, PageResponse } from "@/types/api";
import { PlaceBookmarkResponse, BookmarkFolder, PublicBookmarkFolderResponse } from "@/types/bookmark";

export async function addPlaceBookmark(
  placeId: number,
  folderIds?: number[],
): Promise<PlaceBookmarkResponse> {
  const response = await apiClient.post<ApiResponse<PlaceBookmarkResponse>>(
    `/api/bookmarks/places/${placeId}`,
    { folderIds: folderIds || [] },
  );

  return response.data.data;
}

export async function removePlaceBookmark(
  placeId: number,
): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(
    `/api/bookmarks/places/${placeId}`,
  );
}

export async function getMyPlaceBookmarks(
  page = 0,
  size = 10,
  folderId?: number,
): Promise<PageResponse<PlaceBookmarkResponse>> {
  const response = await apiClient.get<
    ApiResponse<PageResponse<PlaceBookmarkResponse>>
  >("/api/bookmarks/places", {
    params: {
      page,
      size,
      folderId,
    },
  });

  return response.data.data;
}

export async function getBookmarkFolders(): Promise<BookmarkFolder[]> {
  const response = await apiClient.get<ApiResponse<BookmarkFolder[]>>(
    "/api/bookmarks/folders",
  );
  return response.data.data;
}

export async function createBookmarkFolder(
  name: string,
): Promise<BookmarkFolder> {
  const response = await apiClient.post<ApiResponse<BookmarkFolder>>(
    "/api/bookmarks/folders",
    { name },
  );
  return response.data.data;
}

export async function updateBookmarkFolder(
  folderId: number,
  name: string,
): Promise<BookmarkFolder> {
  const response = await apiClient.put<ApiResponse<BookmarkFolder>>(
    `/api/bookmarks/folders/${folderId}`,
    { name },
  );
  return response.data.data;
}

export async function deleteBookmarkFolder(
  folderId: number,
): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(
    `/api/bookmarks/folders/${folderId}`,
  );
}

export async function getPublicBookmarkFolder(
  folderId: number,
): Promise<PublicBookmarkFolderResponse> {
  const response = await apiClient.get<ApiResponse<PublicBookmarkFolderResponse>>(
    `/api/bookmarks/folders/${folderId}/public`,
  );
  return response.data.data;
}
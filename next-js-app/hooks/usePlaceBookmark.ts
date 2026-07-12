import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPlaceBookmark,
  removePlaceBookmark,
  getBookmarkFolders,
  createBookmarkFolder,
  updateBookmarkFolder,
  deleteBookmarkFolder,
  getMyPlaceBookmarks,
} from "@/services/bookmarkService";

export function useAddPlaceBookmark(placeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderIds?: number[]) => addPlaceBookmark(placeId, folderIds),
    onSuccess: (data) => {
      // Synchronously update the place query data to prevent race conditions
      queryClient.setQueryData(["place", placeId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          isBookmarked: true,
          bookmarkFolders: data.folders || [],
        };
      });

      // Return the promise so that the mutation state remains pending until the query refetches
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["place", placeId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["my-place-bookmarks"],
        }),
      ]);
    },
  });
}

export function useRemovePlaceBookmark(placeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removePlaceBookmark(placeId),
    onSuccess: () => {
      // Synchronously update the place query data
      queryClient.setQueryData(["place", placeId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          isBookmarked: false,
          bookmarkFolders: [],
        };
      });

      // Return the promise
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["place", placeId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["my-place-bookmarks"],
        }),
      ]);
    },
  });
}

export function useGetBookmarkFolders() {
  return useQuery({
    queryKey: ["bookmark-folders"],
    queryFn: getBookmarkFolders,
  });
}

export function useCreateBookmarkFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createBookmarkFolder(name),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookmark-folders"],
      });
    },
  });
}

export function useUpdateBookmarkFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ folderId, name }: { folderId: number; name: string }) =>
      updateBookmarkFolder(folderId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookmark-folders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-place-bookmarks"],
      });
    },
  });
}

export function useDeleteBookmarkFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: number) => deleteBookmarkFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookmark-folders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-place-bookmarks"],
      });
    },
  });
}

export function useMyPlaceBookmarks(page = 0, size = 10) {
  return useQuery({
    queryKey: ["my-place-bookmarks", page, size],
    queryFn: () => getMyPlaceBookmarks(page, size),
  });
}
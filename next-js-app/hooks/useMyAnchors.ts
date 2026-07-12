import { useQuery } from "@tanstack/react-query";
import { getMyAnchors, type AnchorSortType } from "@/services/anchorService";

export function useMyAnchors(params: {
  sortType?: AnchorSortType;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ["my-anchors", params],
    queryFn: () => getMyAnchors(params),
  });
}

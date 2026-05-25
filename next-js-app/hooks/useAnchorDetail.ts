import { useQuery } from "@tanstack/react-query";
import { getAnchorDetail } from "@/services/anchorService";

export function useAnchorDetail(anchorId: number) {
    return useQuery({
        queryKey: ["anchor", anchorId],
        queryFn: () => getAnchorDetail(anchorId),
        enabled: Number.isFinite(anchorId),
    });
}
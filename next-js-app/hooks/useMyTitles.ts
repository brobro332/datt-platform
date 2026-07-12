import { useQuery } from "@tanstack/react-query";

import { getMyTitles } from "@/services/titleService";

export function useMyTitles() {
    return useQuery({
        queryKey: ["my-titles"],
        queryFn: getMyTitles,
    });
}
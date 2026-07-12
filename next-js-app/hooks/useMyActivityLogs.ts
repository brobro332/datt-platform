import { useQuery } from "@tanstack/react-query";
import { getMyActivityLogs } from "@/services/activityService";

export function useMyActivityLogs(page = 0, size = 10) {
    return useQuery({
        queryKey: ["my-activity-logs", page, size],
        queryFn: () => getMyActivityLogs(page, size),
    });
}
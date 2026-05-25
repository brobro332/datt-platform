import { useQuery } from "@tanstack/react-query";

import { getMyAchievements } from "@/services/achievementService";

export function useMyAchievements() {
    return useQuery({
        queryKey: ["my-achievements"],
        queryFn: getMyAchievements,
    });
}
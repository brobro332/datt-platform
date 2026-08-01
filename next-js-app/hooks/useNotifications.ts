import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notificationService";

export function useNotifications(page = 0, size = 20) {
    return useQuery({
        queryKey: ["notifications", page, size],
        queryFn: () => notificationService.getMyNotifications(page, size),
        refetchInterval: 60000, // 1 minute
    });
}

export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: ["unreadNotificationCount"],
        queryFn: () => notificationService.getUnreadCount(),
        refetchInterval: 60000, // 1 minute
    });
}

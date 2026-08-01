import { apiClient } from "@/lib/apiClient";
import { Notification } from "@/types/notification";

export const notificationService = {
    getMyNotifications: async (page = 0, size = 20): Promise<{ content: Notification[]; totalPages: number }> => {
        const response = await apiClient.get(`/api/notifications?page=${page}&size=${size}`);
        return response.data;
    },

    getUnreadCount: async (): Promise<{ count: number }> => {
        const response = await apiClient.get(`/api/notifications/unread-count`);
        return response.data;
    },

    readNotification: async (id: number): Promise<void> => {
        await apiClient.post(`/api/notifications/${id}/read`);
    },

    readAllNotifications: async (): Promise<void> => {
        await apiClient.post(`/api/notifications/read-all`);
    }
};

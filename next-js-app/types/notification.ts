export interface Notification {
    id: number;
    memberId: number;
    type: string;
    title: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

import { apiClient } from "@/lib/apiClient";

export interface ChatRoomCreateRequest {
    roomId?: string;
    roomName: string;
    roomType: string;
    targetId: string;
    userId: string;
}

export interface ChatRoomResponse {
    roomId: string;
    roomName: string;
    roomType: string;
    targetId: string;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
    createdAt: string;
}

export interface ChatMessage {
    id: number;
    roomId: string;
    sender: string;
    message: string;
    messageType: "ENTER" | "TALK" | "LEAVE";
    createdAt: string;
}

/**
 * 신규 채팅방 생성 API
 */
export async function createRoom(request: ChatRoomCreateRequest): Promise<ChatRoomResponse> {
    const response = await apiClient.post<ChatRoomResponse>("/api/chat/rooms", request);
    return response.data;
}

/**
 * 특정 톡방 참가 API
 */
export async function joinRoom(roomId: string, userId: string): Promise<void> {
    await apiClient.post(`/api/chat/rooms/${roomId}/join`, null, {
        params: { userId },
    });
}

/**
 * 유저별 참여 톡방 목록 및 안 읽은 메시지 수 조회 API
 */
export async function getRoomsByUser(userId: string): Promise<ChatRoomResponse[]> {
    const response = await apiClient.get<ChatRoomResponse[]>("/api/chat/rooms", {
        params: { userId },
    });
    return response.data;
}

/**
 * 특정 톡방 읽음 처리 API
 */
export async function markAsRead(roomId: string, userId: string): Promise<void> {
    await apiClient.post(`/api/chat/rooms/${roomId}/read`, null, {
        params: { userId },
    });
}

/**
 * 과거 대화 내역 조회 API (최근 50개)
 */
export async function getRecentMessages(roomId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get<ChatMessage[]>(`/api/chat/rooms/${roomId}/messages`);
    return response.data;
}

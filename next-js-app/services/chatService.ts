import { apiClient } from "@/lib/apiClient";

export interface WorkspaceCreateRequest {
    name: string;
    userId: string;
}

export interface WorkspaceResponse {
    id: number;
    name: string;
    inviteCode: string;
    createdAt: string;
}

export interface WorkspaceMember {
    id: number;
    workspaceId: number;
    userId: string;
    role: "OWNER" | "MEMBER";
    joinedAt: string;
}

export interface ChatRoomCreateRequest {
    roomId?: string;
    roomName: string;
    roomType: string;
    targetId: string;
    userId: string;
    workspaceId?: number; // 워크스페이스 ID 추가
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
 * 신규 워크스페이스 개설 API
 */
export async function createWorkspace(request: WorkspaceCreateRequest): Promise<WorkspaceResponse> {
    const response = await apiClient.post<WorkspaceResponse>("/api/workspaces?_nocache=1", request);
    return response.data;
}

/**
 * 유저별 참여 워크스페이스 목록 조회 API
 */
export async function getWorkspacesByUser(userId: string): Promise<WorkspaceResponse[]> {
    if (!userId) {
        console.warn("getWorkspacesByUser called without userId, skipping API call.");
        return [];
    }
    const response = await apiClient.get<WorkspaceResponse[]>("/api/workspaces", {
        params: { userId },
    });
    return response.data;
}

/**
 * 초대 코드로 워크스페이스 참여 API
 */
export async function joinWorkspace(inviteCode: string, userId: string): Promise<WorkspaceResponse> {
    const response = await apiClient.post<WorkspaceResponse>("/api/workspaces/join", null, {
        params: { inviteCode, userId },
    });
    return response.data;
}

/**
 * 특정 워크스페이스 멤버 목록 조회 API
 */
export async function getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]> {
    const response = await apiClient.get<WorkspaceMember[]>(`/api/workspaces/${workspaceId}/members`);
    return response.data;
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
 * 특정 워크스페이스 내부의 채팅방 목록 및 안 읽은 메시지 수 조회 API
 */
export async function getRoomsByWorkspace(workspaceId: number, userId: string): Promise<ChatRoomResponse[]> {
    const response = await apiClient.get<ChatRoomResponse[]>(`/api/chat/workspaces/${workspaceId}/rooms`, {
        params: { userId },
    });
    return response.data;
}

/**
 * 유저별 참여 톡방 목록 및 안 읽은 메시지 수 조회 API (전체 조회용 백업)
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

/**
 * Elasticsearch 기반 채팅방 대화 풀텍스트 검색 API
 */
export async function searchChatMessages(roomId: string, keyword: string): Promise<ChatMessage[]> {
    const response = await apiClient.get<ChatMessage[]>(`/api/chat/rooms/${roomId}/search`, {
        params: { keyword },
    });
    return response.data;
}

export interface WorkspaceAppointmentRequest {
    title: string;
    description: string;
    appointmentTime: string; // ISO String
    location: string;
}

export interface WorkspaceAppointmentResponse {
    id: number;
    workspaceId: number;
    title: string;
    description: string;
    appointmentTime: string;
    location: string;
    creatorId: number;
    createdAt: string;
}

export async function createWorkspaceAppointment(workspaceId: number, request: WorkspaceAppointmentRequest, memberId: number): Promise<WorkspaceAppointmentResponse> {
    const response = await apiClient.post<WorkspaceAppointmentResponse>(`/api/workspaces/${workspaceId}/appointments`, request, {
        headers: { "X-Member-Id": memberId.toString() }
    });
    return response.data;
}

export async function getWorkspaceAppointments(workspaceId: number): Promise<WorkspaceAppointmentResponse[]> {
    const response = await apiClient.get<WorkspaceAppointmentResponse[]>(`/api/workspaces/${workspaceId}/appointments`);
    return response.data;
}

export async function deleteWorkspaceAppointment(workspaceId: number, appointmentId: number, memberId: number): Promise<void> {
    await apiClient.delete(`/api/workspaces/${workspaceId}/appointments/${appointmentId}`, {
        headers: { "X-Member-Id": memberId.toString() }
    });
}


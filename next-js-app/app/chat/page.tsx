"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import {
    getRoomsByUser,
    createRoom,
    joinRoom,
    ChatRoomResponse
} from "@/services/chatService";
import { MessageSquare, Plus, Users, Compass, ChevronRight } from "lucide-react";

export default function ChatRoomsPage() {
    const router = useRouter();
    const { member, isLoggedIn, restoreAuth } = useAuthStore();
    const [rooms, setRooms] = useState<ChatRoomResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // 방 생성 모달 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [newRoomType, setNewRoomType] = useState("LOCAL"); // LOCAL, ANCHOR, DIRECT
    const [newTargetId, setNewTargetId] = useState("");

    // 인증 정보 복구
    useEffect(() => {
        if (!isLoggedIn) {
            restoreAuth();
        }
    }, [isLoggedIn, restoreAuth]);

    // 방 목록 조회
    const fetchRooms = React.useCallback(async () => {
        if (!member) return;
        try {
            const data = await getRoomsByUser(member.memberId.toString());
            setRooms(data);
        } catch (error) {
            console.error("Failed to fetch chat rooms:", error);
        } finally {
            setLoading(false);
        }
    }, [member]);

    useEffect(() => {
        if (isLoggedIn && member) {
            fetchRooms();
        } else if (!isLoggedIn && !loading) {
            // 로그인 상태가 아님
            router.push("/login");
        }
    }, [isLoggedIn, member, loading, fetchRooms, router]);

    // 새 방 생성 및 입장
    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!member || !newRoomName.trim()) return;

        try {
            // 1. 방 생성
            const room = await createRoom({
                roomName: newRoomName,
                roomType: newRoomType,
                targetId: newTargetId || "DEFAULT",
                userId: member.memberId.toString(),
            });

            // 2. 방 멤버로 조인 (생성자 조인)
            await joinRoom(room.roomId, member.memberId.toString());

            // 모달 초기화
            setNewRoomName("");
            setNewTargetId("");
            setIsModalOpen(false);

            // 해당 방으로 바로 이동
            router.push(`/chat/${room.roomId}`);
        } catch (error) {
            console.error("Failed to create room:", error);
            alert("채팅방 생성에 실패했습니다.");
        }
    };

    if (!isLoggedIn || !member) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
                <p className="text-slate-400">인증 정보 확인 중...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white font-sans p-6 pb-20">
            <div className="max-w-4xl mx-auto">
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400">
                            DATT Chat Rooms
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            {member.nickname}님, 실시간 닻(Anchor) 채널에 접속 중입니다.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all font-semibold shadow-lg shadow-teal-900/40 text-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        새 채팅방 개설
                    </button>
                </div>

                {/* 로딩 상태 */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl py-20 px-4 bg-slate-900/30 backdrop-blur-md">
                        <MessageSquare className="w-12 h-12 text-slate-600 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-300">참여 중인 채팅방이 없습니다</h3>
                        <p className="text-sm text-slate-500 mt-1 text-center max-w-xs">
                            오른쪽 위의 새 채팅방 개설 버튼을 눌러 모임에 참여해보세요!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {rooms.map((room) => (
                            <div
                                key={room.roomId}
                                onClick={() => router.push(`/chat/${room.roomId}`)}
                                className="group flex justify-between items-center p-5 bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-teal-500/50 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 text-teal-400 font-bold group-hover:scale-105 transition-transform duration-300">
                                        {room.roomType === "LOCAL" ? (
                                            <Compass className="w-6 h-6" />
                                        ) : (
                                            <Users className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-100 group-hover:text-teal-400 transition-colors">
                                                {room.roomName}
                                            </h3>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                                                {room.roomType}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1 truncate max-w-md">
                                            {room.lastMessage || "대화 기록이 없습니다."}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {room.unreadCount > 0 && (
                                        <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-black bg-rose-500 text-white rounded-full animate-pulse">
                                            {room.unreadCount}
                                        </span>
                                    )}
                                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 모달 창 */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400">
                            새로운 채팅방 개설
                        </h2>
                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    채팅방 이름
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    placeholder="예: 마포구 주민 단톡방"
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    방 종류 (Type)
                                </label>
                                <select
                                    value={newRoomType}
                                    onChange={(e) => setNewRoomType(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm text-slate-300"
                                >
                                    <option value="LOCAL">LOCAL (지역방)</option>
                                    <option value="ANCHOR">ANCHOR (닻 전용)</option>
                                    <option value="DIRECT">DIRECT (1:1 톡)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    타겟 식별자 (Target ID)
                                </label>
                                <input
                                    type="text"
                                    value={newTargetId}
                                    onChange={(e) => setNewTargetId(e.target.value)}
                                    placeholder="예: mapo-station"
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-sm font-medium cursor-pointer"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-xl transition-all text-sm font-semibold shadow-md shadow-teal-950 cursor-pointer"
                                >
                                    방 개설하기
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

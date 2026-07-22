"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useChat } from "@/hooks/useChat";
import { markAsRead } from "@/services/chatService";
import { ArrowLeft, Send, Hash, Sparkles } from "lucide-react";

export default function ChatRoomDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { member, isLoggedIn, restoreAuth } = useAuthStore();
    const roomId = params?.roomId as string;

    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 인증 복구
    useEffect(() => {
        if (!isLoggedIn) {
            restoreAuth();
        }
    }, [isLoggedIn, restoreAuth]);

    // useChat 훅 연동
    const { messages, isConnected, sendMessage } = useChat({
        roomId,
        userId: member?.memberId?.toString() || "",
        senderNickname: member?.nickname || "Anonymous",
    });

    // 입장 시 읽음 처리
    useEffect(() => {
        if (roomId && member) {
            markAsRead(roomId, member.memberId.toString()).catch((err) => {
                console.error("Failed to mark messages as read:", err);
            });
        }
    }, [roomId, member, messages]);

    // 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        sendMessage(inputText);
        setInputText("");
    };

    if (!isLoggedIn || !member) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
                <p className="text-slate-400">인증 정보 확인 중...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white font-sans">
            {/* 상단 네비게이션 바 */}
            <header className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/chat")}
                        className="p-2 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-300" />
                    </button>
                    <div className="flex items-center gap-1.5">
                        <Hash className="w-5 h-5 text-teal-400" />
                        <h2 className="text-lg font-bold text-slate-100">
                            채팅방 상세
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div
                        className={`w-2.5 h-2.5 rounded-full ${
                            isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                        }`}
                    />
                    <span className="text-xs text-slate-400 font-medium">
                        {isConnected ? "실시간 연결됨" : "연결 대기 중"}
                    </span>
                </div>
            </header>

            {/* 대화창 영역 */}
            <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                        <Sparkles className="w-8 h-8 text-teal-500/50 animate-bounce" />
                        <p className="text-sm">대화방에 참여하였습니다.</p>
                        <p className="text-xs text-slate-600">첫 메시지를 보내 소통을 시작해보세요!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.sender === member.nickname;
                        const isSystem = msg.messageType === "ENTER" || msg.messageType === "LEAVE";

                        if (isSystem) {
                            return (
                                <div key={index} className="flex justify-center my-3">
                                    <span className="px-4 py-1.5 bg-slate-900/60 border border-slate-800/50 rounded-full text-xs text-slate-400 font-medium shadow-sm animate-fade-in">
                                        {msg.message}
                                    </span>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={index}
                                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                            >
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-xs text-slate-400 font-semibold">
                                        {msg.sender}
                                    </span>
                                    {isMe && (
                                        <span className="text-[10px] px-1 bg-teal-950 text-teal-400 border border-teal-800 rounded font-semibold scale-90">
                                            나
                                        </span>
                                    )}
                                </div>
                                <div className={`flex items-end gap-2 max-w-[70%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                    <div
                                        className={`px-4 py-2.5 rounded-2xl text-sm shadow-md transition-all duration-200 ${
                                            isMe
                                                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-tr-none"
                                                : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                                        }`}
                                    >
                                        <p className="leading-relaxed break-all whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                    <span className="text-[9px] text-slate-500 shrink-0 font-medium select-none mb-1">
                                        {msg.createdAt
                                            ? new Date(msg.createdAt).toLocaleTimeString([], {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                              })
                                            : ""}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* 하단 입력 폼 */}
            <footer className="p-4 bg-slate-900/90 border-t border-slate-800 backdrop-blur-md">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        disabled={!isConnected}
                        className="flex-1 px-5 py-3 bg-slate-950 border border-slate-800/80 rounded-2xl focus:border-teal-500 focus:outline-none transition-colors text-sm text-slate-200 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || !isConnected}
                        className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 disabled:from-slate-800 disabled:to-slate-800 rounded-2xl hover:from-teal-600 hover:to-emerald-600 transition-all font-semibold shadow-lg shadow-teal-900/20 flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </form>
            </footer>
        </div>
    );
}

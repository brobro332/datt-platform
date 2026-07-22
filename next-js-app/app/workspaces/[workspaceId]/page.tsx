"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useChat } from "@/hooks/useChat";
import { getRoomsByWorkspace, markAsRead, searchChatMessages, ChatMessage } from "@/services/chatService";
import { Send, Hash, Sparkles, Search, X, MessageSquare } from "lucide-react";

export default function WorkspaceDashboardHomePage() {
    const params = useParams();
    const { member, isLoggedIn, restoreAuth } = useAuthStore();
    
    const workspaceId = Number(params?.workspaceId);
    const [roomId, setRoomId] = useState<string>("");
    const [inputText, setInputText] = useState("");
    const [loadingRoom, setLoadingRoom] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 대화 검색 상태
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
    const [searching, setSearching] = useState(false);

    // 인증 복구
    useEffect(() => {
        if (!isLoggedIn) {
            restoreAuth();
        }
    }, [isLoggedIn, restoreAuth]);

    // 워크스페이스의 고유 첫 번째 채팅방 조회
    useEffect(() => {
        if (!workspaceId || !member) return;

        setLoadingRoom(true);
        getRoomsByWorkspace(workspaceId, member.nickname)
            .then((rooms) => {
                if (rooms && rooms.length > 0) {
                    setRoomId(rooms[0].roomId);
                } else {
                    console.warn("No default chat room found for workspace:", workspaceId);
                }
            })
            .catch((err) => {
                console.error("Failed to load workspace chat room:", err);
            })
            .finally(() => {
                setLoadingRoom(false);
            });
    }, [workspaceId, member]);

    // useChat 훅 연동 (roomId가 비어있을 때는 내부적으로 대기)
    const { messages, isConnected, sendMessage } = useChat({
        roomId,
        userId: member?.nickname || "",
        senderNickname: member?.nickname || "Anonymous",
    });

    // 입장 시 읽음 처리
    useEffect(() => {
        if (roomId && member) {
            markAsRead(roomId, member.nickname).catch((err) => {
                console.error("Failed to mark messages as read:", err);
            });
        }
    }, [roomId, member, messages]);

    // 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 실시간 검색 디바운싱
    useEffect(() => {
        if (!roomId || !searchKeyword.trim()) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        const delayDebounceFn = setTimeout(() => {
            searchChatMessages(roomId, searchKeyword)
                .then((res) => {
                    setSearchResults(res || []);
                })
                .catch((err) => {
                    console.error("Search failed:", err);
                })
                .finally(() => {
                    setSearching(false);
                });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchKeyword, roomId]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        sendMessage(inputText);
        setInputText("");
    };

    if (!isLoggedIn || !member) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-800">
                <p className="text-slate-500">인증 정보 확인 중...</p>
            </div>
        );
    }

    if (loadingRoom) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-850 gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <p className="text-xs text-slate-450 font-semibold">대화방 연결 중...</p>
            </div>
        );
    }

    if (!roomId) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-400 gap-3 p-6 text-center">
                <Sparkles className="w-8 h-8 text-slate-300 animate-pulse" />
                <h3 className="font-extrabold text-slate-800 text-sm">연결된 대화방이 없습니다</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    서버 측에 문제가 생겼거나 채팅방이 누락되었습니다. <br />
                    관리자에게 문의하시거나 다시 접속해 주세요.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#f8fafc]/40 text-slate-800 overflow-hidden relative">
            {/* 상단 채널 헤더 */}
            <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200/80 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Hash className="w-5 h-5 text-indigo-650 shrink-0" />
                    <h2 className="text-sm font-black text-slate-850 truncate">
                        모임 채팅
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    {/* 검색 돋보기 단추 */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        title="대화 검색"
                    >
                        <Search className="w-4 h-4" />
                    </button>

                    <div className="w-[1px] h-3 bg-slate-200" />

                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${
                                isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                            }`}
                        />
                        <span className="text-xs text-slate-500 font-medium">
                            {isConnected ? "실시간 연결됨" : "연결 대기 중"}
                        </span>
                    </div>
                </div>
            </header>

            {/* 대화 피드 영역 */}
            <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-slate-50/20">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                        <Sparkles className="w-8 h-8 text-indigo-650/40 animate-bounce" />
                        <p className="text-sm text-slate-500">대화방에 참여하였습니다.</p>
                        <p className="text-xs text-slate-400 font-medium">첫 메시지를 보내 소통을 시작해보세요!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.sender === member.nickname;
                        const isSystem = msg.messageType === "ENTER" || msg.messageType === "LEAVE";

                        if (isSystem) {
                            return (
                                <div key={index} className="flex justify-center my-3">
                                    <span className="px-3 py-1 bg-slate-200/60 border border-slate-350/20 rounded-full text-[10px] text-slate-500 font-bold shadow-sm">
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
                                    <span className="text-xs text-slate-500 font-semibold">
                                        {msg.sender}
                                    </span>
                                    {isMe && (
                                        <span className="text-[9px] px-1 bg-indigo-50 text-indigo-650 border border-indigo-200 rounded font-semibold scale-90">
                                            나
                                        </span>
                                    )}
                                </div>
                                <div className={`flex items-end gap-2 max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                    <div
                                        className={`px-3.5 py-2 rounded-2xl text-xs font-medium shadow-sm transition-all duration-200 leading-relaxed ${
                                            isMe
                                                ? "bg-indigo-600 text-white rounded-tr-none"
                                                : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                                        }`}
                                    >
                                        <p className="break-all whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                    <span className="text-[8px] text-slate-400 shrink-0 font-bold select-none mb-0.5">
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

            {/* 메세지 입력 폼 */}
            <footer className="p-4 bg-white border-t border-slate-200/80 shrink-0">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        disabled={!isConnected}
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-250/60 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-xs text-slate-800 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || !isConnected}
                        className="px-4 py-2.5 bg-indigo-600 disabled:bg-slate-350 text-white rounded-xl hover:bg-indigo-750 transition-all font-semibold shadow-md shadow-indigo-100 flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </form>
            </footer>

            {/* [Elasticsearch 대화 검색 슬라이드오버/모달] */}
            {isSearchOpen && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-30 flex justify-end">
                    {/* 바깥 영역 클릭 시 닫기 */}
                    <div className="flex-1" onClick={() => setIsSearchOpen(false)} />
                    
                    {/* 검색 패널 본체 */}
                    <div className="w-80 bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                        {/* 검색 패널 헤더 */}
                        <div className="px-4 py-4 border-b border-slate-200/60 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-1.5">
                                <Search className="w-4 h-4 text-indigo-650" />
                                <span className="text-xs font-bold text-slate-800">대화 검색 (Elasticsearch)</span>
                            </div>
                            <button
                                onClick={() => setIsSearchOpen(false)}
                                className="p-1 hover:bg-slate-200 rounded-lg text-slate-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* 검색어 입력창 */}
                        <div className="p-3 border-b border-slate-100">
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="검색어를 입력해 보세요..."
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-xs text-slate-800"
                                autoFocus
                            />
                        </div>

                        {/* 검색 결과 영역 */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {searching ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                    <span className="text-[10px] text-slate-450 font-bold">대화 색인 탐색 중...</span>
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-250 animate-pulse" />
                                    <p className="text-xs font-semibold">검색 결과가 없습니다.</p>
                                    <p className="text-[10px] text-slate-400 mt-1">대화방 내 텍스트를 검색해 보세요.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="px-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                        매칭된 대화 ({searchResults.length}건)
                                    </div>
                                    {searchResults.map((msg, i) => (
                                        <div
                                            key={i}
                                            className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 hover:border-indigo-400 transition-colors"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] font-extrabold text-slate-700">{msg.sender}</span>
                                                <span className="text-[8px] text-slate-400 font-bold">
                                                    {msg.createdAt
                                                        ? new Date(msg.createdAt).toLocaleDateString([], {
                                                              month: "short",
                                                              day: "numeric",
                                                              hour: "2-digit",
                                                              minute: "2-digit"
                                                          })
                                                        : ""}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-650 break-all leading-relaxed whitespace-pre-wrap">
                                                {msg.message}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

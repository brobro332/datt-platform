"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { MainLayout } from "@/layouts/MainLayout";
import {
    getWorkspacesByUser,
    getRoomsByWorkspace,
    getWorkspaceMembers,
    joinRoom,
    WorkspaceResponse,
    ChatRoomResponse,
    WorkspaceMember
} from "@/services/chatService";
import {
    Plus, Users, UserPlus, Home,
    MessageSquare, Copy, Check, Compass, Calendar, Menu, X
} from "lucide-react";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const { member, isLoggedIn, restoreAuth } = useAuthStore();

    const workspaceId = Number(params?.workspaceId);

    // 데이터 상태
    const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceResponse | null>(null);
    const [rooms, setRooms] = useState<ChatRoomResponse[]>([]);
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [loading, setLoading] = useState(true);

    // 모바일 드로어(Drawer) 및 친구 초대 상태
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // 인증 정보 복구
    useEffect(() => {
        if (!isLoggedIn) {
            restoreAuth();
        }
    }, [isLoggedIn, restoreAuth]);

    // 전체 데이터 로드
    const loadWorkspaceData = React.useCallback(async () => {
        if (!member || !workspaceId) return;

        try {
            // member.nickname으로 유저 정보 조회
            const wsList = await getWorkspacesByUser(member.nickname);
            setWorkspaces(wsList);

            const curr = wsList.find((w) => w.id === workspaceId);
            if (curr) {
                setCurrentWorkspace(curr);
            } else {
                router.push("/workspaces");
                return;
            }

            // member.nickname으로 룸 조회
            const roomList = await getRoomsByWorkspace(workspaceId, member.nickname);
            setRooms(roomList);

            const memberList = await getWorkspaceMembers(workspaceId);
            setMembers(memberList);

        } catch (error) {
            console.error("Failed to load workspace data:", error);
        } finally {
            setLoading(false);
        }
    }, [member, workspaceId, router]);

    useEffect(() => {
        if (isLoggedIn && member && workspaceId) {
            loadWorkspaceData();
        } else if (!isLoggedIn && !loading) {
            router.push("/login");
        }
    }, [isLoggedIn, member, workspaceId, loading, loadWorkspaceData, router]);

    // 라우트가 변경될 때 모바일 사이드바를 자동으로 닫기
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [pathname]);

    const handleCopyInvite = () => {
        if (!currentWorkspace) return;
        navigator.clipboard.writeText(currentWorkspace.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading || !currentWorkspace || !member) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] text-slate-800">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650"></div>
                <p className="text-slate-500 mt-4 text-xs font-semibold">워크스페이스 구성 중...</p>
            </div>
        );
    }

    // 1레벨 사이드바 (워크스페이스 아이콘 목록) 컴포넌트
    const WorkspaceSelector = () => (
        <aside className="w-16 shrink-0 bg-slate-900 flex flex-col items-center py-4 gap-4.5">
            <button
                onClick={() => router.push("/workspaces")}
                className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 flex items-center justify-center cursor-pointer transition-all duration-200"
                title="워크스페이스 홈"
            >
                <Home className="w-5 h-5" />
            </button>
            <div className="w-8 h-[1px] bg-slate-800 my-0.5" />

            <div className="flex-1 w-full flex flex-col items-center gap-3 overflow-y-auto">
                {workspaces.map((ws) => {
                    const isCurrent = ws.id === workspaceId;
                    return (
                        <button
                            key={ws.id}
                            onClick={() => router.push(`/workspaces/${ws.id}`)}
                            className={`w-11 h-11 rounded-xl font-extrabold flex items-center justify-center text-xs cursor-pointer transition-all duration-200 relative group ${
                                isCurrent
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30"
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                            }`}
                            title={ws.name}
                        >
                            {isCurrent && (
                                <div className="absolute left-0 top-3.5 w-1 h-4 bg-white rounded-r-full" />
                            )}
                            {ws.name.substring(0, 2)}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => router.push("/workspaces")}
                className="w-11 h-11 rounded-xl bg-slate-800 text-teal-400 border border-teal-500/20 hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-all duration-200"
                title="새 워크스페이스 생성/참가"
            >
                <Plus className="w-5 h-5" />
            </button>
        </aside>
    );

    // 2레벨 사이드바 (일정 계획 네비게이터 및 멤버 목록) 컴포넌트
    const NavigationPanel = () => (
        <aside className="w-56 shrink-0 bg-slate-50 border-r border-slate-200/80 flex flex-col">
            {/* 워크스페이스 헤더 */}
            <div className="px-4 py-4 border-b border-slate-200/60 flex justify-between items-center bg-slate-50">
                <div className="min-w-0">
                    <h2 className="font-extrabold text-slate-800 truncate text-xs">
                        {currentWorkspace.name}
                    </h2>
                    <span className="text-[9px] text-slate-450 font-mono font-bold uppercase">
                        Code: {currentWorkspace.inviteCode}
                    </span>
                </div>
                <button
                    onClick={() => setIsInviteOpen(true)}
                    className="p-1.5 hover:bg-slate-200/60 rounded-lg text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                    title="친구 초대하기"
                >
                    <UserPlus className="w-4 h-4" />
                </button>
            </div>

            {/* 스크롤 가능한 메뉴 영역 */}
            <div className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
                {/* 일정 계획 대시보드 메뉴 */}
                <div className="space-y-1">
                    <div className="px-3 mb-2 text-slate-450">
                        <span className="text-[10px] font-black tracking-wider uppercase">일정 계획 프로세스</span>
                    </div>
                    
                    {/* 1. 모임 채팅 (단일 픽스 탭) */}
                    <button
                        onClick={() => router.push(`/workspaces/${workspaceId}`)}
                        className={`w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-left text-xs font-bold transition-all cursor-pointer ${
                            pathname === `/workspaces/${workspaceId}`
                                ? "bg-indigo-50/80 text-indigo-650 shadow-sm"
                                : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                        }`}
                    >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                        <span>모임 채팅</span>
                    </button>

                    {/* 2. 약속 캘린더 */}
                    <div className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-400 select-none">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>약속 캘린더</span>
                        </div>
                        <span className="text-[8px] scale-90 px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded font-bold border border-slate-300/40">
                            준비중
                        </span>
                    </div>

                    {/* 3. 닻 코스 빌딩 */}
                    <div className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-400 select-none">
                        <div className="flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5" />
                            <span>닻 코스 빌딩</span>
                        </div>
                        <span className="text-[8px] scale-90 px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded font-bold border border-slate-300/40">
                            준비중
                        </span>
                    </div>

                    {/* 4. 결정 투표방 */}
                    <div className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-400 select-none">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>결정 투표방</span>
                        </div>
                        <span className="text-[8px] scale-90 px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded font-bold border border-slate-300/40">
                            준비중
                        </span>
                    </div>
                </div>

                {/* 참여 멤버 리스트 */}
                <div>
                    <div className="flex items-center px-3 mb-2 text-slate-450">
                        <Users className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                        <span className="text-[10px] font-black tracking-wider uppercase">멤버 ({members.length})</span>
                    </div>
                    <div className="space-y-0.5 px-1">
                        {members.map((m) => (
                            <div
                                key={m.id}
                                className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-slate-600"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="truncate">{m.userId}</span>
                                {m.role === "OWNER" && (
                                    <span className="text-[8px] scale-90 px-1 bg-indigo-50 text-indigo-650 border border-indigo-200 rounded font-semibold shrink-0">
                                        Owner
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );

    return (
        <MainLayout requireAuth>
            {/* 상용급 반응형 레이아웃: 모바일(h-[580px]), PC(h-[650px]) */}
            <div className="h-[580px] md:h-[650px] bg-white border border-slate-200/80 shadow-lg rounded-3xl overflow-hidden flex text-slate-800 relative">
                
                {/* [PC 전용 사이드바 1레벨 & 2레벨] */}
                <div className="hidden md:flex shrink-0">
                    <WorkspaceSelector />
                    <NavigationPanel />
                </div>

                {/* [모바일 전용 햄버거 토글 슬라이드 Drawer] */}
                {isMobileSidebarOpen && (
                    <div className="md:hidden fixed inset-0 z-40 flex">
                        {/* 어두운 배경 막 (클릭 시 닫기) */}
                        <div 
                            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
                            onClick={() => setIsMobileSidebarOpen(false)}
                        />
                        
                        {/* 슬라이드 보드 본체 */}
                        <div className="relative flex w-72 bg-white h-full shadow-2xl animate-in slide-in-from-left duration-250 z-50 overflow-hidden">
                            <WorkspaceSelector />
                            <NavigationPanel />
                            
                            {/* 드로어 닫기 버튼 */}
                            <button
                                onClick={() => setIsMobileSidebarOpen(false)}
                                className="absolute right-3.5 top-3.5 p-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* [우측 영역] 모바일 해상도에서는 햄버거 메뉴 버튼을 위한 패스 스토어 기능 내장 */}
                <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/30">
                    {/* 모바일에서만 노출되는 최상단 헤더 바 (메뉴 버튼 연동) */}
                    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/60 shrink-0">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                            title="메뉴 열기"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h3 className="text-xs font-bold text-slate-850 truncate max-w-[200px]">
                            {currentWorkspace.name}
                        </h3>
                        <div className="w-9 h-9" /> {/* 우측 정렬 밸런스용 */}
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {children}
                    </div>
                </main>
            </div>

            {/* 모달: 친구 초대 (라이트 모드 스타일) */}
            {isInviteOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4 animate-fade-in">
                    <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-800">
                        <h2 className="text-lg font-bold mb-2 text-slate-900">
                            친구 초대하기
                        </h2>
                        <p className="text-xs text-slate-500 mb-6">
                            아래 코드를 복사해서 친구에게 알려주세요. 초대 코드로 해당 워크스페이스에 참여할 수 있습니다.
                        </p>

                        <div className="flex gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl items-center mb-6">
                            <span className="flex-1 font-mono text-sm px-2 text-indigo-650 font-bold select-all">
                                {currentWorkspace.inviteCode}
                            </span>
                            <button
                                onClick={handleCopyInvite}
                                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-100"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>복사됨</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>코드 복사</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsInviteOpen(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl transition-colors text-xs font-semibold cursor-pointer"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

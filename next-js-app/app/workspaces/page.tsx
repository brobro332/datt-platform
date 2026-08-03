"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { MainLayout } from "@/layouts/MainLayout";
import {
    getWorkspacesByUser,
    createWorkspace,
    joinWorkspace,
    getReceivedInvitations,
    respondToInvitation,
    WorkspaceResponse,
    WorkspaceInvitationResponse
} from "@/services/chatService";
import { FolderPlus, UserPlus, ChevronRight, Layout, Check, X } from "lucide-react";

export default function WorkspacesPage() {
    const router = useRouter();
    const { member, isLoggedIn, restoreAuth } = useAuthStore();
    const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
    const [receivedInvitations, setReceivedInvitations] = useState<WorkspaceInvitationResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // 크루 생성
    const [newWsName, setNewWsName] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // 초대 코드로 참가
    const [inviteCode, setInviteCode] = useState("");
    const [isJoinOpen, setIsJoinOpen] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            restoreAuth();
        }
    }, [isLoggedIn, restoreAuth]);

    const fetchWorkspaces = React.useCallback(async () => {
        if (!member) return;
        try {
            const targetUserId = member.nickname || String(member.memberId);
            const data = await getWorkspacesByUser(targetUserId);
            setWorkspaces(data);

            const invites = await getReceivedInvitations(targetUserId);
            setReceivedInvitations(invites);
        } catch (error) {
            console.error("Failed to fetch workspaces:", error);
        } finally {
            setLoading(false);
        }
    }, [member]);

    useEffect(() => {
        if (isLoggedIn && member) {
            fetchWorkspaces();
        } else if (!isLoggedIn && !loading) {
            router.push("/login");
        }
    }, [isLoggedIn, member, loading, fetchWorkspaces, router]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!member || !newWsName.trim()) return;

        try {
            const targetUserId = member.nickname || String(member.memberId);
            const ws = await createWorkspace({
                name: newWsName,
                userId: targetUserId,
            });
            setNewWsName("");
            setIsCreateOpen(false);
            router.push(`/workspaces/${ws.id}`);
        } catch (error) {
            console.error("Failed to create workspace:", error);
            alert("크루 개설에 실패했습니다.");
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!member || !inviteCode.trim()) return;

        try {
            const targetUserId = member.nickname || String(member.memberId);
            const ws = await joinWorkspace(inviteCode, targetUserId);
            setInviteCode("");
            setIsJoinOpen(false);
            router.push(`/workspaces/${ws.id}`);
        } catch (error) {
            console.error("Failed to join workspace:", error);
            alert(error instanceof Error ? error.message : "크루 참가에 실패했습니다. 코드를 확인해 주세요.");
        }
    };

    const handleRespondInvitation = async (invitationId: number, accept: boolean) => {
        if (!member) return;
        try {
            const targetUserId = member.nickname || String(member.memberId);
            await respondToInvitation(invitationId, targetUserId, accept);
            alert(accept ? "크루 초대를 수락했습니다." : "크루 초대를 거절했습니다.");
            fetchWorkspaces();
        } catch (error: any) {
            alert(error.response?.data?.message || "처리에 실패했습니다.");
        }
    };

    if (!isLoggedIn || !member) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] text-slate-800">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650"></div>
                <p className="text-slate-500 mt-4 text-sm font-semibold">인증 정보를 가져오는 중...</p>
            </div>
        );
    }

    return (
        <MainLayout requireAuth>
            <section className="space-y-8 pb-20 max-w-4xl mx-auto px-4 animate-in fade-in duration-500">
                <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/50 bg-white/80 p-8 md:p-10 shadow-sm backdrop-blur-md">
                    <div className="mb-8">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-widest">
                            <Layout className="w-4 h-4" /> WORKSPACE HUB
                        </p>
                        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                            크루
                        </h1>
                        <p className="mt-1.5 text-xs text-slate-500">
                            {member.nickname}님, 함께 약속을 계획하고 일정을 조율할 수 있는 독립 공간입니다.
                        </p>
                    </div>

                    {/* 메인 선택 카드 (생성 / 참가) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                    <button
                        onClick={() => {
                            setIsCreateOpen(true);
                            setIsJoinOpen(false);
                        }}
                        className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200/60 hover:border-indigo-400 hover:shadow-lg rounded-2xl cursor-pointer transition-all duration-300 group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                            <FolderPlus className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">새 크루 개설</h3>
                        <p className="text-xs text-slate-450 text-center">모임을 위한 새로운 계획 공간을 만듭니다.</p>
                    </button>

                    <button
                        onClick={() => {
                            setIsJoinOpen(true);
                            setIsCreateOpen(false);
                        }}
                        className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200/60 hover:border-indigo-400 hover:shadow-lg rounded-2xl cursor-pointer transition-all duration-300 group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-sky-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">초대 코드로 참가</h3>
                        <p className="text-xs text-slate-450 text-center">친구에게 받은 공유 코드로 공간에 참여합니다.</p>
                    </button>
                </div>

                {/* 동적 폼 영역 */}
                {isCreateOpen && (
                    <form onSubmit={handleCreate} className="bg-white border border-slate-200/80 p-5 rounded-2xl mb-8 animate-in slide-in-from-top-4 duration-200">
                        <h4 className="font-bold text-sm text-slate-800 mb-3">새 크루 정보 입력</h4>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                required
                                value={newWsName}
                                onChange={(e) => setNewWsName(e.target.value)}
                                placeholder="예: 고등학교 동창 마포 번개"
                                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-sm text-slate-800"
                            />
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer shadow-md shadow-indigo-100"
                            >
                                개설하기
                            </button>
                        </div>
                    </form>
                )}

                {isJoinOpen && (
                    <form onSubmit={handleJoin} className="bg-white border border-slate-200/80 p-5 rounded-2xl mb-8 animate-in slide-in-from-top-4 duration-200">
                        <h4 className="font-bold text-sm text-slate-800 mb-3">초대 코드 입력</h4>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                required
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="예: WS-INV-A1B2C3"
                                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-sm text-slate-800"
                            />
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer shadow-md shadow-indigo-100"
                            >
                                참여하기
                            </button>
                        </div>
                    </form>
                )}

                {/* 받은 초대장 영역 */}
                {receivedInvitations.length > 0 && (
                    <div className="bg-white border border-indigo-200/60 rounded-2xl p-6 shadow-sm mb-8 animate-in fade-in">
                        <h3 className="text-xs font-black text-indigo-650 tracking-wider mb-4 uppercase">
                            받은 초대장 ({receivedInvitations.length})
                        </h3>
                        <div className="grid gap-3">
                            {receivedInvitations.map((inv) => (
                                <div key={inv.id} className="flex justify-between items-center p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">
                                            {inv.workspaceName}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            <span className="font-bold">{inv.senderUserId}</span>님이 초대를 보냈습니다.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleRespondInvitation(inv.id, true)}
                                            className="w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRespondInvitation(inv.id, false)}
                                            className="w-8 h-8 flex items-center justify-center bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 내 크루 목록 */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-black text-slate-450 tracking-wider mb-4 uppercase">
                        가입한 크루 목록 ({workspaces.length})
                    </h3>
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : workspaces.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-xl">
                            <p className="text-slate-450 text-xs">아직 참여 중인 크루가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {workspaces.map((ws) => (
                                <div
                                    key={ws.id}
                                    onClick={() => router.push(`/workspaces/${ws.id}`)}
                                    className="group flex justify-between items-center p-4 bg-slate-50 hover:bg-indigo-50/40 border border-slate-100 hover:border-indigo-200/50 rounded-xl cursor-pointer transition-all duration-300"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-slate-200/60 text-slate-650 group-hover:bg-indigo-100 group-hover:text-indigo-650 font-extrabold flex items-center justify-center group-hover:scale-105 transition-all">
                                            {ws.name.substring(0, 2)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 group-hover:text-indigo-650 transition-colors text-sm">
                                                {ws.name}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                                                초대 코드: <span className="font-mono text-slate-500 font-bold">{ws.inviteCode}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-650 group-hover:translate-x-0.5 transition-all" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                </div>
            </section>
        </MainLayout>
    );
}

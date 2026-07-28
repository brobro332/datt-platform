"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { 
    getWorkspaceAppointments, 
    createWorkspaceAppointment, 
    deleteWorkspaceAppointment, 
    WorkspaceAppointmentResponse 
} from "@/services/chatService";
import { Calendar, Plus, MapPin, Clock, X } from "lucide-react";

export default function WorkspaceCalendarPage() {
    const params = useParams();
    const { member, isLoggedIn, restoreAuth } = useAuthStore();
    const workspaceId = Number(params?.workspaceId);

    const [appointments, setAppointments] = useState<WorkspaceAppointmentResponse[]>([]);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

    // 새 약속 폼 상태
    const [newApptTitle, setNewApptTitle] = useState("");
    const [newApptDesc, setNewApptDesc] = useState("");
    const [newApptDate, setNewApptDate] = useState("");
    const [newApptTime, setNewApptTime] = useState("");
    const [newApptLoc, setNewApptLoc] = useState("");

    useEffect(() => {
        if (!isLoggedIn) {
            restoreAuth();
        }
    }, [isLoggedIn, restoreAuth]);

    useEffect(() => {
        if (workspaceId && isLoggedIn) {
            fetchAppointments();
        }
    }, [workspaceId, isLoggedIn]);

    const fetchAppointments = async () => {
        setLoadingAppointments(true);
        try {
            const data = await getWorkspaceAppointments(workspaceId);
            setAppointments(data);
        } catch (err) {
            console.error("Failed to load appointments:", err);
        } finally {
            setLoadingAppointments(false);
        }
    };

    const handleCreateAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newApptTitle || !newApptDate || !newApptTime) return;

        try {
            const dateTime = new Date(`${newApptDate}T${newApptTime}`).toISOString();
            await createWorkspaceAppointment(workspaceId, {
                title: newApptTitle,
                description: newApptDesc,
                appointmentTime: dateTime,
                location: newApptLoc,
            }, member?.memberId || 1);

            setNewApptTitle("");
            setNewApptDesc("");
            setNewApptDate("");
            setNewApptTime("");
            setNewApptLoc("");
            setIsCreatingAppointment(false);
            fetchAppointments();
        } catch (err) {
            console.error("Failed to create appointment", err);
            alert("약속 생성에 실패했습니다.");
        }
    };

    const handleDeleteAppointment = async (apptId: number) => {
        if (!confirm("이 약속을 취소하시겠습니까?")) return;
        try {
            await deleteWorkspaceAppointment(workspaceId, apptId, member?.memberId || 1);
            fetchAppointments();
        } catch (err) {
            console.error("Failed to delete appointment", err);
            alert("삭제 권한이 없거나 실패했습니다.");
        }
    };

    if (!isLoggedIn || !member) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-800">
                <p className="text-slate-500">인증 정보 확인 중...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/50 p-6 overflow-y-auto">
            <header className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-lg font-bold text-slate-800">모임 약속 캘린더</h2>
                </div>
                {!isCreatingAppointment && (
                    <button
                        onClick={() => setIsCreatingAppointment(true)}
                        className="px-4 py-2 flex items-center gap-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm text-sm font-semibold"
                    >
                        <Plus className="w-4 h-4" />
                        새 약속 만들기
                    </button>
                )}
            </header>

            {isCreatingAppointment && (
                <form onSubmit={handleCreateAppointment} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <h4 className="text-sm font-bold text-slate-800 mb-2 border-b pb-2">새 약속 등록</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">약속 제목</label>
                            <input required type="text" value={newApptTitle} onChange={e=>setNewApptTitle(e.target.value)} className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" placeholder="예) 강남역 저녁 모임" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">날짜</label>
                            <input required type="date" value={newApptDate} onChange={e=>setNewApptDate(e.target.value)} className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">시간</label>
                            <input required type="time" value={newApptTime} onChange={e=>setNewApptTime(e.target.value)} className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">장소</label>
                            <input type="text" value={newApptLoc} onChange={e=>setNewApptLoc(e.target.value)} className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" placeholder="장소를 입력하세요" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">설명 (선택)</label>
                            <textarea value={newApptDesc} onChange={e=>setNewApptDesc(e.target.value)} className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" placeholder="참석 인원, 준비물 등 간단한 메모" rows={3} />
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                        <button type="button" onClick={() => setIsCreatingAppointment(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">취소</button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-md shadow-indigo-200">저장</button>
                    </div>
                </form>
            )}

            {loadingAppointments ? (
                <div className="flex-1 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : appointments.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl py-20">
                    <Calendar className="w-12 h-12 text-slate-200 mb-4" />
                    <p className="text-sm font-semibold text-slate-600">예정된 약속이 없습니다.</p>
                    <p className="text-xs mt-1">새 약속을 만들어 팀원들과 일정을 공유하세요.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {appointments.map(appt => (
                        <div key={appt.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition group relative">
                            <h4 className="text-base font-bold text-slate-800 mb-3 pr-6">{appt.title}</h4>
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                    <div className="p-1.5 bg-indigo-50 rounded-lg"><Clock className="w-4 h-4 text-indigo-500" /></div>
                                    {new Date(appt.appointmentTime).toLocaleString([], { month:'long', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                                </div>
                                {appt.location && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                        <div className="p-1.5 bg-rose-50 rounded-lg"><MapPin className="w-4 h-4 text-rose-500" /></div>
                                        {appt.location}
                                    </div>
                                )}
                            </div>
                            {appt.description && (
                                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mt-2 line-clamp-3 leading-relaxed border border-slate-100">
                                    {appt.description}
                                </p>
                            )}
                            
                            <button 
                                onClick={() => handleDeleteAppointment(appt.id)}
                                className="absolute top-4 right-4 p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition"
                                title="삭제"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

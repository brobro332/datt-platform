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
import { Calendar, ChevronLeft, ChevronRight, Plus, MapPin, Clock, X, Info } from "lucide-react";

const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export default function WorkspaceCalendarPage() {
    const params = useParams();
    const { member, isLoggedIn, restoreAuth } = useAuthStore();
    const workspaceId = Number(params?.workspaceId);

    const [appointments, setAppointments] = useState<WorkspaceAppointmentResponse[]>([]);
    const [loadingAppointments, setLoadingAppointments] = useState(true);

    const [currentDate, setCurrentDate] = useState(new Date());

    // 새 약속 폼 모달 상태
    const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
    const [newApptTitle, setNewApptTitle] = useState("");
    const [newApptDesc, setNewApptDesc] = useState("");
    const [newApptDate, setNewApptDate] = useState("");
    const [newApptTime, setNewApptTime] = useState("");
    const [newApptLoc, setNewApptLoc] = useState("");

    // 약속 상세 모달 상태
    const [selectedAppointment, setSelectedAppointment] = useState<WorkspaceAppointmentResponse | null>(null);

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
            setSelectedAppointment(null);
            fetchAppointments();
        } catch (err) {
            console.error("Failed to delete appointment", err);
            alert("삭제 권한이 없거나 실패했습니다.");
        }
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToday = () => setCurrentDate(new Date());

    const openCreateModalForDate = (dateStr: string) => {
        setNewApptDate(dateStr);
        setNewApptTime("19:00");
        setIsCreatingAppointment(true);
    };

    if (!isLoggedIn || !member) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-800">
                <p className="text-slate-500">인증 정보 확인 중...</p>
            </div>
        );
    }

    // 달력 계산
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

    const calendarCells = [];
    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        calendarCells.push({
            date: new Date(currentYear, currentMonth - 1, prevMonthDays - i),
            isCurrentMonth: false,
        });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarCells.push({
            date: new Date(currentYear, currentMonth, i),
            isCurrentMonth: true,
        });
    }
    // Next month padding (total 42 cells)
    const remainingCells = 42 - calendarCells.length;
    for (let i = 1; i <= remainingCells; i++) {
        calendarCells.push({
            date: new Date(currentYear, currentMonth + 1, i),
            isCurrentMonth: false,
        });
    }

    // 약속 데이터를 날짜별로 그룹핑
    const appointmentsByDate: Record<string, WorkspaceAppointmentResponse[]> = {};
    appointments.forEach(appt => {
        const dateStr = appt.appointmentTime.split("T")[0];
        if (!appointmentsByDate[dateStr]) {
            appointmentsByDate[dateStr] = [];
        }
        appointmentsByDate[dateStr].push(appt);
    });

    const todayStr = formatDateString(new Date());
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                        <h2 className="text-xl font-bold text-slate-800">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                    </div>
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-white rounded-md transition text-slate-600">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={goToday} className="px-3 py-1.5 text-sm font-semibold hover:bg-white rounded-md transition text-slate-700">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-white rounded-md transition text-slate-600">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setNewApptDate(todayStr);
                        setNewApptTime("19:00");
                        setIsCreatingAppointment(true);
                    }}
                    className="px-4 py-2 flex items-center gap-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm text-sm font-semibold"
                >
                    <Plus className="w-4 h-4" />
                    Create
                </button>
            </header>

            {/* Calendar Grid */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Days of week */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                    {weekDays.map((day, idx) => (
                        <div key={day} className={`py-2 text-center text-xs font-semibold ${idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : 'text-slate-600'}`}>
                            {day}
                        </div>
                    ))}
                </div>
                
                {/* Days Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-6">
                    {calendarCells.map((cell, idx) => {
                        const dateStr = formatDateString(cell.date);
                        const isToday = dateStr === todayStr;
                        const dayAppts = appointmentsByDate[dateStr] || [];

                        return (
                            <div 
                                key={idx} 
                                onClick={(e) => {
                                    // 빈 공간 클릭 시 생성 모달
                                    if (e.target === e.currentTarget) {
                                        openCreateModalForDate(dateStr);
                                    }
                                }}
                                className={`border-r border-b border-slate-200 min-h-[80px] p-1 cursor-pointer hover:bg-slate-50 transition ${!cell.isCurrentMonth ? 'bg-slate-50/50' : ''}`}
                            >
                                <div className="flex justify-center mb-1">
                                    <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                                        isToday 
                                        ? 'bg-indigo-600 text-white' 
                                        : !cell.isCurrentMonth 
                                            ? 'text-slate-400' 
                                            : cell.date.getDay() === 0 
                                                ? 'text-rose-500' 
                                                : cell.date.getDay() === 6 
                                                    ? 'text-blue-500' 
                                                    : 'text-slate-700'
                                    }`}>
                                        {cell.date.getDate()}
                                    </span>
                                </div>
                                <div className="space-y-1 overflow-y-auto max-h-[calc(100%-28px)] no-scrollbar">
                                    {dayAppts.map(appt => {
                                        const timeStr = new Date(appt.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                        return (
                                            <div 
                                                key={appt.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedAppointment(appt);
                                                }}
                                                className="bg-indigo-100 text-indigo-700 text-[11px] px-1.5 py-0.5 rounded border border-indigo-200 truncate cursor-pointer hover:bg-indigo-200 transition"
                                            >
                                                <span className="font-semibold mr-1">{timeStr}</span>
                                                {appt.title}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create Appointment Modal */}
            {isCreatingAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <form onSubmit={handleCreateAppointment} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg font-bold text-slate-800">새 약속 등록</h3>
                            <button type="button" onClick={() => setIsCreatingAppointment(false)} className="p-1 hover:bg-slate-100 rounded-lg transition">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
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
                        <div className="flex gap-3 justify-end pt-6 mt-2">
                            <button type="button" onClick={() => setIsCreatingAppointment(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">취소</button>
                            <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-md shadow-indigo-200">저장</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Appointment Detail Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setSelectedAppointment(null)}>
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4 border-b pb-3">
                            <h3 className="text-lg font-bold text-slate-800 pr-4 leading-tight">{selectedAppointment.title}</h3>
                            <button type="button" onClick={() => setSelectedAppointment(null)} className="p-1 hover:bg-slate-100 rounded-lg transition shrink-0">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3 text-slate-700">
                                <div className="p-2 bg-indigo-50 rounded-lg shrink-0"><Clock className="w-4 h-4 text-indigo-600" /></div>
                                <span className="text-sm font-medium">
                                    {new Date(selectedAppointment.appointmentTime).toLocaleString([], { month:'long', day:'numeric', weekday: 'short', hour:'2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            {selectedAppointment.location && (
                                <div className="flex items-center gap-3 text-slate-700">
                                    <div className="p-2 bg-rose-50 rounded-lg shrink-0"><MapPin className="w-4 h-4 text-rose-600" /></div>
                                    <span className="text-sm font-medium">{selectedAppointment.location}</span>
                                </div>
                            )}
                            {selectedAppointment.description && (
                                <div className="flex items-start gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="mt-0.5 shrink-0"><Info className="w-4 h-4 text-slate-400" /></div>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedAppointment.description}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <button 
                                onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                                className="px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                                삭제하기
                            </button>
                            <button 
                                onClick={() => setSelectedAppointment(null)}
                                className="px-5 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition shadow-md"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

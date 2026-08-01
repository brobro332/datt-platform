"use client";

import React, { useState, useEffect } from "react";
import { supportService } from "@/services/supportService";
import { ServiceInquiry, Report } from "@/types/support";
import { CheckCircle, Clock } from "lucide-react";

export default function AdminSupportPage() {
    const [activeTab, setActiveTab] = useState<"inquiries" | "reports">("inquiries");
    const [inquiries, setInquiries] = useState<ServiceInquiry[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "inquiries") {
                const data = await supportService.getInquiries();
                setInquiries(data.content);
            } else {
                const data = await supportService.getReports();
                setReports(data.content);
            }
        } catch (err) {
            console.error(err);
            alert("데이터를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleResolveInquiry = async (id: number) => {
        if (!confirm("해당 문의를 처리 완료하시겠습니까?")) return;
        try {
            await supportService.resolveInquiry(id);
            fetchData();
        } catch (err) {
            alert("상태 변경에 실패했습니다.");
        }
    };

    const handleResolveReport = async (id: number) => {
        if (!confirm("해당 신고를 처리 완료하시겠습니까?")) return;
        try {
            await supportService.resolveReport(id);
            fetchData();
        } catch (err) {
            alert("상태 변경에 실패했습니다.");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">고객 지원 관리</h1>
            
            <div className="flex border-b border-slate-200 mb-6">
                <button 
                    onClick={() => setActiveTab("inquiries")}
                    className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
                        activeTab === "inquiries" 
                        ? "border-indigo-600 text-indigo-600" 
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                >
                    서비스 문의 내역
                </button>
                <button 
                    onClick={() => setActiveTab("reports")}
                    className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
                        activeTab === "reports" 
                        ? "border-indigo-600 text-indigo-600" 
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                >
                    신고 접수 내역
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : activeTab === "inquiries" ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-slate-600">ID</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">분류</th>
                                <th className="px-4 py-3 font-semibold text-slate-600 w-1/2">내용</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">작성자</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">작성일</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">상태</th>
                                <th className="px-4 py-3 font-semibold text-slate-600 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {inquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">문의 내역이 없습니다.</td>
                                </tr>
                            ) : inquiries.map(inq => (
                                <tr key={inq.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-600">{inq.id}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                                            inq.category === "IMPROVEMENT" ? "bg-blue-100 text-blue-700" : "bg-teal-100 text-teal-700"
                                        }`}>
                                            {inq.category === "IMPROVEMENT" ? "개선건의" : "매장등록"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="line-clamp-2 text-slate-700 whitespace-pre-wrap">{inq.content}</p>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{inq.authorId}</td>
                                    <td className="px-4 py-3 text-slate-500">{new Date(inq.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`flex items-center gap-1.5 text-xs font-bold ${
                                            inq.status === "RESOLVED" ? "text-emerald-600" : "text-amber-500"
                                        }`}>
                                            {inq.status === "RESOLVED" ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                            {inq.status === "RESOLVED" ? "처리완료" : "대기중"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {inq.status !== "RESOLVED" && (
                                            <button 
                                                onClick={() => handleResolveInquiry(inq.id)}
                                                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition"
                                            >
                                                처리
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-slate-600">ID</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">구분</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">대상 ID</th>
                                <th className="px-4 py-3 font-semibold text-slate-600 w-1/3">사유</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">신고자</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">신고일</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">상태</th>
                                <th className="px-4 py-3 font-semibold text-slate-600 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">신고 내역이 없습니다.</td>
                                </tr>
                            ) : reports.map(rep => (
                                <tr key={rep.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-600">{rep.id}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                                            rep.targetType === "PLACE" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                                        }`}>
                                            {rep.targetType === "PLACE" ? "매장" : "리뷰"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{rep.targetId}</td>
                                    <td className="px-4 py-3">
                                        <p className="line-clamp-2 text-slate-700 whitespace-pre-wrap">{rep.reason}</p>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{rep.reporterId}</td>
                                    <td className="px-4 py-3 text-slate-500">{new Date(rep.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`flex items-center gap-1.5 text-xs font-bold ${
                                            rep.status === "RESOLVED" ? "text-emerald-600" : "text-amber-500"
                                        }`}>
                                            {rep.status === "RESOLVED" ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                            {rep.status === "RESOLVED" ? "처리완료" : "대기중"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {rep.status !== "RESOLVED" && (
                                            <button 
                                                onClick={() => handleResolveReport(rep.id)}
                                                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition"
                                            >
                                                처리
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

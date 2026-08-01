"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { supportService } from "@/services/supportService";
import { MessageSquarePlus, Send, CheckCircle2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function SupportPage() {
    const { isLoggedIn, restoreAuth } = useAuthStore();
    const router = useRouter();
    const queryClient = useQueryClient();
    
    const [category, setCategory] = useState("IMPROVEMENT");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            restoreAuth();
        }
    }, [isLoggedIn, restoreAuth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn) {
            alert("로그인이 필요합니다.");
            return;
        }
        if (!content.trim()) {
            alert("내용을 입력해주세요.");
            return;
        }

        setIsSubmitting(true);
        try {
            await supportService.createInquiry({ category, content });
            
            // 캐시 갱신
            queryClient.invalidateQueries({ queryKey: ["myInquiries"] });
            
            setIsSuccess(true);
            setContent("");
        } catch (err) {
            console.error(err);
            alert("접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6 h-full">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
                    <CheckCircle2 className="w-16 h-16 text-teal-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">접수 완료!</h2>
                    <p className="text-slate-600 mb-6">소중한 의견을 남겨주셔서 감사합니다.<br/>빠르게 검토하여 더 나은 서비스를 만들겠습니다.</p>
                    <button 
                        onClick={() => router.push("/")}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8 flex items-center gap-4">
                    <button 
                        onClick={() => router.back()} 
                        className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition cursor-pointer"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="p-3 bg-indigo-100 rounded-xl">
                        <MessageSquarePlus className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">서비스 문의</h1>
                        <p className="text-sm text-slate-500 mt-1">플랫폼 개선 아이디어나 신규 매장 등록을 건의해 주세요.</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-3">문의 유형</label>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => setCategory("IMPROVEMENT")}
                                className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition ${
                                    category === "IMPROVEMENT" 
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                💡 서비스 개선 건의
                            </button>
                            <button
                                type="button"
                                onClick={() => setCategory("STORE_REGISTRATION")}
                                className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition ${
                                    category === "STORE_REGISTRATION" 
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                🏪 새로운 매장 등록
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">상세 내용</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={
                                category === "IMPROVEMENT"
                                ? "불편했던 점이나 추가되었으면 하는 기능을 자유롭게 적어주세요."
                                : "등록을 원하시는 매장의 이름, 위치(주소), 특징 등을 자세히 적어주시면 빠르게 추가해 드립니다."
                            }
                            rows={8}
                            className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none text-slate-700"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
                        >
                            {isSubmitting ? "전송 중..." : (
                                <>
                                    제출하기
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

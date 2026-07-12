"use client";

import { useState } from "react";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { ActivityLogItem } from "@/components/activity/ActivityLogItem";
import { useMyActivityLogs } from "@/hooks/useMyActivityLogs";

const PAGE_SIZE = 3;

export function ActivityLogSection() {
    const [page, setPage] = useState(0);

    const {
        data,
        isLoading,
        isError,
    } = useMyActivityLogs(page, PAGE_SIZE);

    function handlePreviousPage() {
        setPage((currentPage) => Math.max(currentPage - 1, 0));
    }

    function handleNextPage() {
        if (!data || data.last) {
            return;
        }
        setPage((currentPage) => currentPage + 1);
    }

    return (
        <section className="flex flex-col h-full justify-between min-h-0">
            <div className="flex items-center justify-between shrink-0 mb-2">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Activity Timeline
                    </p>
                    <h2 className="mt-0.5 text-sm font-extrabold text-slate-900">
                        최근 활동
                    </h2>
                </div>

                <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {data
                        ? `${data.totalElements.toLocaleString()}개`
                        : "조회 전"}
                </p>
            </div>

            <div className="flex-1 flex flex-col justify-between mt-2 min-h-0">
                <AsyncStateView
                    isLoading={isLoading}
                    isError={isError}
                    isEmpty={Boolean(data?.empty)}
                    loadingMessage="활동 로그를 불러오는 중입니다..."
                    errorTitle="활동 로그 조회 실패"
                    errorMessage="활동 로그를 불러오지 못했습니다."
                    emptyTitle="아직 활동 로그가 없습니다."
                    emptyDescription="장소 저장, 리뷰 작성, Anchor 생성을 해보세요."
                >
                    {data && (
                        <div className="flex flex-col h-full justify-between min-h-0">
                            <ol className="space-y-3.5 border-l border-slate-200 pl-4 overflow-y-auto flex-1 min-h-0">
                                {data.content.map((log) => (
                                    <ActivityLogItem
                                        key={log.activityLogId}
                                        log={log}
                                    />
                                ))}
                            </ol>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 shrink-0">
                                <p className="text-xs font-black text-slate-500">
                                    {data.number + 1} / {data.totalPages} 페이지
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled={data.first}
                                        onClick={handlePreviousPage}
                                        className="px-3.5 h-8 rounded-lg text-xs font-black border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none hover:border-slate-300 transition cursor-pointer"
                                    >
                                        이전
                                    </button>

                                    <button
                                        type="button"
                                        disabled={data.last}
                                        onClick={handleNextPage}
                                        className="px-3.5 h-8 rounded-lg text-xs font-black border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none hover:border-slate-300 transition cursor-pointer"
                                    >
                                        다음
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </AsyncStateView>
            </div>
        </section>
    );
}
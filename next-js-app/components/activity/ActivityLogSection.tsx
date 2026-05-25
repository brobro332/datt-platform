"use client";

import { useState } from "react";

import { Button } from "@/components/common/Button";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { ActivityLogItem } from "@/components/activity/ActivityLogItem";

import { useMyActivityLogs } from "@/hooks/useMyActivityLogs";

const PAGE_SIZE = 10;

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
        <section className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-500">
                        Activity Timeline
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-gray-950">
                        최근 활동
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        DATT에서 경험치를 획득한 활동 기록입니다.
                    </p>
                </div>

                <p className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                    {data
                        ? `${data.totalElements.toLocaleString()}개`
                        : "조회 전"}
                </p>
            </div>

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
                    <>
                        <ol className="space-y-4 border-l border-gray-200 pl-4">
                            {data.content.map((log) => (
                                <ActivityLogItem
                                    key={log.activityLogId}
                                    log={log}
                                />
                            ))}
                        </ol>

                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                {data.number + 1} / {data.totalPages} 페이지
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={data.first}
                                    onClick={handlePreviousPage}
                                >
                                    이전
                                </Button>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={data.last}
                                    onClick={handleNextPage}
                                >
                                    다음
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </AsyncStateView>
        </section>
    );
}
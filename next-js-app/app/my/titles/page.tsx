"use client";

import { MainLayout } from "@/layouts/MainLayout";

import { AsyncStateView } from "@/components/common/AsyncStateView";
import { TitleCard } from "@/components/title/TitleCard";

import { useMyTitles } from "@/hooks/useMyTitles";
import { useSelectMyTitle } from "@/hooks/useTitleMutation";

export default function MyTitlesPage() {
    const {
        data: titles,
        isLoading,
        isError,
    } = useMyTitles();

    const selectTitleMutation = useSelectMyTitle();

    const selectedTitle = titles?.find((title) => title.selected);

    return (
        <MainLayout>
            <section className="space-y-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm font-semibold text-gray-500">
                            Title Collection
                        </p>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                            칭호
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-gray-600">
                            활동을 통해 획득한 칭호를 확인하고 대표 칭호를 설정할 수 있습니다.
                        </p>
                    </div>

                    <div className="rounded-3xl bg-gray-950 px-6 py-4 text-white">
                        <p className="text-sm text-gray-300">
                            대표 칭호
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {selectedTitle?.name ?? "없음"}
                        </p>
                    </div>
                </div>

                <AsyncStateView
                    isLoading={isLoading}
                    isError={isError}
                    isEmpty={Boolean(titles && titles.length === 0)}
                    loadingMessage="칭호 정보를 불러오는 중입니다..."
                    errorTitle="칭호 조회 실패"
                    errorMessage="칭호 정보를 불러오지 못했습니다."
                    emptyTitle="보유한 칭호가 없습니다."
                    emptyDescription="DATT 활동을 통해 칭호를 획득해보세요."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        {titles?.map((title) => (
                            <TitleCard
                                key={title.titleId}
                                title={title}
                                isPending={selectTitleMutation.isPending}
                                onSelect={(titleId) =>
                                    selectTitleMutation.mutate(titleId)
                                }
                            />
                        ))}
                    </div>
                </AsyncStateView>
            </section>
        </MainLayout>
    );
}
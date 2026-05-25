"use client";

import { MainLayout } from "@/layouts/MainLayout";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { AchievementCard } from "@/components/achievement/AchievementCard";

import { useMyAchievements } from "@/hooks/useMyAchievements";

export default function MyAchievementsPage() {
    const {
        data: achievements,
        isLoading,
        isError,
    } = useMyAchievements();

    const achievedCount =
        achievements?.filter((achievement) => achievement.achieved).length ?? 0;

    const totalCount = achievements?.length ?? 0;

    return (
        <MainLayout>
            <section className="space-y-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm font-semibold text-gray-500">
                            Achievement
                        </p>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                            업적
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-gray-600">
                            DATT 활동을 통해 달성한 업적을 확인할 수 있습니다.
                        </p>
                    </div>

                    <div className="rounded-3xl bg-gray-950 px-6 py-4 text-white">
                        <p className="text-sm text-gray-300">
                            달성 업적
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {achievedCount} / {totalCount}
                        </p>
                    </div>
                </div>

                <AsyncStateView
                    isLoading={isLoading}
                    isError={isError}
                    isEmpty={Boolean(achievements && achievements.length === 0)}
                    loadingMessage="업적 정보를 불러오는 중입니다..."
                    errorTitle="업적 조회 실패"
                    errorMessage="업적 정보를 불러오지 못했습니다."
                    emptyTitle="업적 정보가 없습니다."
                    emptyDescription="아직 등록된 업적이 없습니다."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        {achievements?.map((achievement) => (
                            <AchievementCard
                                key={achievement.achievementId}
                                achievement={achievement}
                            />
                        ))}
                    </div>
                </AsyncStateView>
            </section>
        </MainLayout>
    );
}
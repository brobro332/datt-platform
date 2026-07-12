"use client";

import { MainLayout } from "@/layouts/MainLayout";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { AchievementCard } from "@/components/achievement/AchievementCard";
import { useMyAchievements } from "@/hooks/useMyAchievements";
import { Trophy } from "lucide-react";

export default function MyAchievementsPage() {
  const {
    data: achievements,
    isLoading,
    isError,
  } = useMyAchievements();

  const achievedCount = achievements?.filter((achievement) => achievement.achieved).length ?? 0;
  const totalCount = achievements?.length ?? 0;

  const percent = totalCount > 0 ? Math.round((achievedCount / totalCount) * 100) : 0;

  return (
    <MainLayout requireAuth>
      <section className="space-y-8 pb-32">
        {/* Header Hero Card */}
        <div className="rounded-[2.5rem] border border-white/85 bg-white/60 p-8 md:p-10 shadow-[0_30px_100px_rgba(99,102,241,0.05)] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-emerald-250/15 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 animate-bounce" /> Achievements
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">업적</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-xl font-semibold">
                DATT 탐험 활동을 통해 잠금 해제한 업적 배지입니다. 특별한 칭호 획득 조건을 충족해 보세요.
              </p>
            </div>

            <div className="rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-950 px-8 py-5 text-white shadow-xl flex items-center gap-5 shrink-0 border border-indigo-900/30">
              <div>
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                  달성 업적률
                </p>
                <p className="mt-0.5 text-2xl font-black">
                  {achievedCount} / {totalCount}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full border-4 border-indigo-500/20 flex items-center justify-center text-xs font-black relative">
                <span className="relative z-10 text-indigo-300">{percent}%</span>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin pointer-events-none" style={{ animationDuration: '4s' }} />
              </div>
            </div>
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
          <div className="grid gap-6 md:grid-cols-2">
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
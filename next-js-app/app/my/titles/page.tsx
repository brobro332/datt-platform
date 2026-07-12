"use client";

import { MainLayout } from "@/layouts/MainLayout";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { TitleCard } from "@/components/title/TitleCard";
import { useMyTitles } from "@/hooks/useMyTitles";
import { useSelectMyTitle } from "@/hooks/useTitleMutation";
import { Crown } from "lucide-react";

export default function MyTitlesPage() {
  const {
    data: titles,
    isLoading,
    isError,
  } = useMyTitles();

  const selectTitleMutation = useSelectMyTitle();
  const selectedTitle = titles?.find((title) => title.selected);

  return (
    <MainLayout requireAuth>
      <section className="space-y-8 pb-32">
        {/* Header Hero Card */}
        <div className="rounded-[2.5rem] border border-white/85 bg-white/60 p-8 md:p-10 shadow-[0_30px_100px_rgba(99,102,241,0.05)] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-amber-250/15 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" /> Title Collection
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">칭호 보관함</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-xl font-semibold">
                활동 퀘스트를 달성하여 획득한 한정판 대표 칭호입니다. 나만의 개성을 프로필에 나타내 보세요.
              </p>
            </div>

            <div className="rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-950 px-8 py-5 text-white shadow-xl flex flex-col justify-center shrink-0 border border-indigo-900/30 min-w-[200px]">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                현재 장착한 칭호
              </p>
              <p className="mt-1 text-lg font-black text-amber-300 drop-shadow-sm truncate max-w-[180px] flex items-center gap-1.5">
                <Crown className="w-4 h-4 fill-amber-300 text-amber-300 shrink-0" /> {selectedTitle?.name ?? "장착한 칭호 없음"}
              </p>
            </div>
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
          emptyDescription="DATT 활동을 통해 첫 칭호를 획득해 보세요!"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {titles?.map((title) => (
              <TitleCard
                key={title.titleId}
                title={title}
                isPending={selectTitleMutation.isPending}
                onSelect={(titleId) => selectTitleMutation.mutate(titleId)}
              />
            ))}
          </div>
        </AsyncStateView>
      </section>
    </MainLayout>
  );
}
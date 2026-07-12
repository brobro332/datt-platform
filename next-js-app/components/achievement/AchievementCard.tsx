import type { MemberAchievementResponse } from "@/types/achievement";
import { Trophy, Lock, Calendar } from "lucide-react";

type AchievementCardProps = {
  achievement: MemberAchievementResponse;
};

export function AchievementCard({
  achievement,
}: AchievementCardProps) {
  return (
    <article
      className={[
        "rounded-[2rem] border p-6 transition-all duration-300 hover:-translate-y-1.5",
        achievement.achieved
          ? "border-emerald-500/20 bg-gradient-to-br from-white/90 to-emerald-50/10 shadow-[0_12px_40px_rgba(16,185,129,0.06)]"
          : "border-slate-200 bg-white/70 opacity-55 shadow-[0_8px_30px_rgba(0,0,0,0.015)]",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        {/* Modern circular badge token */}
        <div className="relative shrink-0">
          {achievement.achieved && (
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-md animate-pulse" />
          )}
          <div className={`relative h-14 w-14 rounded-full flex items-center justify-center border-2 shadow-inner transition-transform duration-500 hover:rotate-12 ${
            achievement.achieved
              ? "bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 border-emerald-500/30"
              : "bg-slate-50 text-slate-400 border-slate-200"
          }`}>
            {achievement.achieved ? (
              <Trophy className="w-6 h-6 text-emerald-600 fill-emerald-600/10" />
            ) : (
              <Lock className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
              {achievement.code}
            </span>
            <span
              className={[
                "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border",
                achievement.achieved
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                  : "bg-slate-100 text-slate-500 border-slate-200/50",
              ].join(" ")}
            >
              {achievement.achieved ? "unlocked" : "locked"}
            </span>
          </div>

          <h3 className="text-base font-black text-slate-900 leading-tight">
            {achievement.name}
          </h3>

          <p className="text-xs font-semibold leading-relaxed text-slate-500">
            {achievement.description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100/80 pt-4 text-xs font-bold">
        <span className="font-extrabold text-indigo-650 bg-indigo-50/60 px-3 py-1 rounded-xl border border-indigo-100/30">
          +{achievement.rewardExp} EXP
        </span>

        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
          {achievement.achievedAt ? (
            <>
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>{new Date(achievement.achievedAt).toLocaleDateString()} 달성</span>
            </>
          ) : (
            "잠금 상태"
          )}
        </p>
      </div>
    </article>
  );
}
import { Card } from "@/components/common/Card";

type LevelProgressCardProps = {
    level: number;
    exp: number;
    requiredExpForNextLevel: number;
};

export function LevelProgressCard({
    level,
    exp,
    requiredExpForNextLevel,
}: LevelProgressCardProps) {
    const progressPercent =
        requiredExpForNextLevel > 0
            ? Math.min(
                  Math.round((exp / requiredExpForNextLevel) * 100),
                  100,
              )
            : 100;

    const remainingExp =
        requiredExpForNextLevel > exp
            ? requiredExpForNextLevel - exp
            : 0;

    return (
        <Card className="p-6 overflow-hidden relative">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-20" />
            
            <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Level Progress
                    </p>

                    <h2 className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-black text-slate-900">
                        Lv. {level}
                    </h2>

                    <p className="mt-1 text-[10.5px] sm:text-xs font-semibold text-slate-400 whitespace-nowrap truncate">
                        다음 Lv까지 <span className="text-indigo-600 font-extrabold">{remainingExp} EXP</span> 남음
                    </p>
                </div>

                <div className="rounded-2xl bg-slate-900 px-3 py-2 sm:px-5 sm:py-3 text-white shadow-lg shadow-slate-950/15 bg-gradient-to-tr from-slate-950 to-indigo-950 text-right shrink-0">
                    <p className="text-[9px] sm:text-[10px] font-semibold text-slate-450 uppercase tracking-widest">현재 경험치</p>
                    <p className="mt-0.5 text-lg sm:text-2xl font-black">
                        {exp}
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold">
                  <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {exp} EXP
                    </span>

                    <span className="text-slate-400">
                        {requiredExpForNextLevel} EXP
                    </span>
                </div>

                <div className="mt-3.5 h-3 overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/20">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 transition-all duration-500"
                        style={{
                            width: `${progressPercent}%`,
                        }}
                    />
                </div>

                <p className="mt-1.5 text-right text-xs font-extrabold text-indigo-600">
                    {progressPercent}%
                </p>
            </div>
        </Card>
    );
}
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
        <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-gray-500">
                        Level Progress
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-gray-950">
                        Lv. {level}
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        다음 레벨까지 {remainingExp} EXP 남았습니다.
                    </p>
                </div>

                <div className="rounded-3xl bg-gray-950 px-5 py-4 text-white">
                    <p className="text-xs text-gray-300">현재 경험치</p>
                    <p className="mt-1 text-2xl font-bold">
                        {exp}
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-700">
                        {exp} EXP
                    </span>

                    <span className="text-gray-500">
                        {requiredExpForNextLevel} EXP
                    </span>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                        className="h-full rounded-full bg-gray-950 transition-all"
                        style={{
                            width: `${progressPercent}%`,
                        }}
                    />
                </div>

                <p className="mt-2 text-right text-xs text-gray-500">
                    {progressPercent}%
                </p>
            </div>
        </Card>
    );
}
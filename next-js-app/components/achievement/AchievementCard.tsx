import type { MemberAchievementResponse } from "@/types/achievement";

type AchievementCardProps = {
    achievement: MemberAchievementResponse;
};

export function AchievementCard({
    achievement,
}: AchievementCardProps) {
    return (
        <article
            className={[
                "rounded-3xl border p-5 shadow-sm transition",
                achievement.achieved
                    ? "border-gray-200 bg-white"
                    : "border-gray-100 bg-gray-50 opacity-70",
            ].join(" ")}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-gray-500">
                        {achievement.code}
                    </p>

                    <h3 className="mt-2 text-lg font-bold text-gray-950">
                        {achievement.name}
                    </h3>
                </div>

                <span
                    className={[
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        achievement.achieved
                            ? "bg-gray-900 text-white"
                            : "bg-gray-200 text-gray-500",
                    ].join(" ")}
                >
                    {achievement.achieved ? "달성" : "미달성"}
                </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-600">
                {achievement.description}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700">
                    +{achievement.rewardExp} EXP
                </p>

                <p className="text-xs text-gray-400">
                    {achievement.achievedAt
                        ? new Date(achievement.achievedAt).toLocaleDateString()
                        : "아직 달성 전"}
                </p>
            </div>
        </article>
    );
}
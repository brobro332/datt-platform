import type { MemberActivityLogResponse } from "@/types/activity";

type ActivityLogItemProps = {
    log: MemberActivityLogResponse;
};

function getActivityLabel(activityType: string) {
    switch (activityType) {
        case "BOOKMARK_ADD":
            return "장소 저장";
        case "PLACE_REVIEW_CREATE":
            return "리뷰 작성";
        case "ANCHOR_CREATE":
            return "Anchor 생성";
        case "ANCHOR_LIKE_RECEIVED":
            return "Anchor 좋아요 획득";
        case "POPULAR_ANCHOR_SELECTED":
            return "인기 Anchor 선정";
        default:
            return "활동";
    }
}

function getActivityIcon(activityType: string) {
    switch (activityType) {
        case "BOOKMARK_ADD":
            return "🔖";
        case "PLACE_REVIEW_CREATE":
            return "✍️";
        case "ANCHOR_CREATE":
            return "⚓";
        case "ANCHOR_LIKE_RECEIVED":
            return "❤️";
        case "POPULAR_ANCHOR_SELECTED":
            return "🏆";
        default:
            return "✨";
    }
}

export function ActivityLogItem({ log }: ActivityLogItemProps) {
    return (
        <li className="relative pl-10">
            <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm">
                {getActivityIcon(log.activityType)}
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-gray-950">
                            {getActivityLabel(log.activityType)}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            {log.description}
                        </p>

                        <p className="mt-3 text-xs text-gray-400">
                            {new Date(log.createdAt).toLocaleString()}
                        </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-indigo-50 border border-indigo-100/50 px-3 py-1 text-xs font-extrabold text-indigo-600 shadow-sm">
                        +{log.expAmount} EXP
                    </span>
                </div>
            </div>
        </li>
    );
}
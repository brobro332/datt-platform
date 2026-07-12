import { Card } from "@/components/common/Card";

type GrowthSummaryCardsProps = {
    titleCount: number;
    achievementCount: number;
    reviewCount: number;
    anchorCount: number;
};

export function GrowthSummaryCards({
    titleCount,
    achievementCount,
    reviewCount,
    anchorCount,
}: GrowthSummaryCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card className="flex items-center justify-between border-l-4 border-l-amber-500">
                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        보유 칭호
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-850">
                        {titleCount}
                    </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl">
                    👑
                </div>
            </Card>

            <Card className="flex items-center justify-between border-l-4 border-l-rose-500">
                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        달성 업적
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-855">
                        {achievementCount}
                    </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-xl">
                    🏆
                </div>
            </Card>

            <Card className="flex items-center justify-between border-l-4 border-l-teal-500">
                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        작성 리뷰
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-860">
                        {reviewCount}
                    </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-xl">
                    📝
                </div>
            </Card>

            <Card className="flex items-center justify-between border-l-4 border-l-indigo-500">
                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        생성 Anchor
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-865">
                        {anchorCount}
                    </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                    ⚓
                </div>
            </Card>
        </div>
    );
}
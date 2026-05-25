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
            <Card>
                <p className="text-sm font-semibold text-gray-500">
                    보유 칭호
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-950">
                    {titleCount}
                </p>
            </Card>

            <Card>
                <p className="text-sm font-semibold text-gray-500">
                    달성 업적
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-950">
                    {achievementCount}
                </p>
            </Card>

            <Card>
                <p className="text-sm font-semibold text-gray-500">
                    작성 리뷰
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-950">
                    {reviewCount}
                </p>
            </Card>

            <Card>
                <p className="text-sm font-semibold text-gray-500">
                    생성 Anchor
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-950">
                    {anchorCount}
                </p>
            </Card>
        </div>
    );
}
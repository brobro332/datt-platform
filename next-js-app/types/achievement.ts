export type MemberAchievementResponse = {
    achievementId: number;
    code: string;
    name: string;
    description: string;
    rewardExp: number;
    achieved: boolean;
    achievedAt: string | null;
};
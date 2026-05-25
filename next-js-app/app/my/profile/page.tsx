"use client";

import Link from "next/link";

import { MainLayout } from "@/layouts/MainLayout";
import { Card } from "@/components/common/Card";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";

import { useMyProfile } from "@/hooks/useMyProfile";
import { ActivityLogSection } from "@/components/activity/ActivityLogSection";
import { LevelProgressCard } from "@/components/gamification/LevelProgressCard";
import { GrowthSummaryCards } from "@/components/gamification/grawthSummaryCard";

export default function MyProfilePage() {
    const {
        data: profile,
        isLoading,
        isError,
    } = useMyProfile();

    if (isLoading) {
        return (
            <MainLayout>
                <LoadingState message="프로필 정보를 불러오는 중입니다..." />
            </MainLayout>
        );
    }

    if (isError || !profile) {
        return (
            <MainLayout>
                <ErrorState
                    title="프로필 조회 실패"
                    message="프로필 정보를 불러오지 못했습니다."
                />
            </MainLayout>
        );
    }

    const expPercent =
        profile.requiredExpForNextLevel > 0
            ? Math.min(
                  Math.round(
                      (profile.exp / profile.requiredExpForNextLevel) * 100,
                  ),
                  100,
              )
            : 100;

    return (
        <MainLayout>
            <section className="space-y-6">
                <Card className="p-8">
                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                        <div>
                            <p className="text-sm font-semibold text-gray-500">
                                My Profile
                            </p>

                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                                {profile.nickname}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                {profile.email}
                            </p>

                            <div className="mt-4 inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                                {profile.selectedTitle
                                    ? profile.selectedTitle.name
                                    : "대표 칭호 없음"}
                            </div>
                        </div>

                        <div className="rounded-3xl bg-gray-950 px-6 py-5 text-white">
                            <p className="text-sm text-gray-300">Level</p>
                            <p className="mt-1 text-4xl font-bold">
                                {profile.level}
                            </p>
                        </div>
                    </div>
                </Card>

                <LevelProgressCard
                  level={profile.level}
                  exp={profile.exp}
                  requiredExpForNextLevel={profile.requiredExpForNextLevel}
                />

                <GrowthSummaryCards
                  titleCount={profile.titleCount}
                  achievementCount={profile.achievementCount}
                  reviewCount={profile.activitySummary.reviewCount}
                  anchorCount={profile.activitySummary.anchorCount}
                />

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <p className="text-sm font-semibold text-gray-500">
                            저장 장소
                        </p>
                        <p className="mt-2 text-2xl font-bold text-gray-950">
                            {profile.activitySummary.bookmarkCount}
                        </p>
                    </Card>

                    <Card>
                        <p className="text-sm font-semibold text-gray-500">
                            리뷰
                        </p>
                        <p className="mt-2 text-2xl font-bold text-gray-950">
                            {profile.activitySummary.reviewCount}
                        </p>
                    </Card>

                    <Card>
                        <p className="text-sm font-semibold text-gray-500">
                            Anchor
                        </p>
                        <p className="mt-2 text-2xl font-bold text-gray-950">
                            {profile.activitySummary.anchorCount}
                        </p>
                    </Card>

                    <Card>
                        <p className="text-sm font-semibold text-gray-500">
                            받은 좋아요
                        </p>
                        <p className="mt-2 text-2xl font-bold text-gray-950">
                            {profile.activitySummary.receivedLikeCount}
                        </p>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-950">
                                최근 Anchor
                            </h2>

                            <Link
                                href="/my/anchors"
                                className="text-sm font-semibold text-gray-700 hover:underline"
                            >
                                전체 보기
                            </Link>
                        </div>

                        {profile.recentAnchors.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                아직 생성한 Anchor가 없습니다.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {profile.recentAnchors.map((anchor) => (
                                    <Link
                                        key={anchor.anchorId}
                                        href={`/anchors/${anchor.anchorId}`}
                                        className="block rounded-2xl border border-gray-100 p-4 transition hover:bg-gray-50"
                                    >
                                        <p className="font-semibold text-gray-950">
                                            {anchor.title}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {anchor.basePlaceName ??
                                                "기준 장소 없음"}
                                        </p>

                                        <p className="mt-2 text-xs text-gray-400">
                                            조회수 {anchor.viewCount}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card>
                        <h2 className="mb-4 text-xl font-bold text-gray-950">
                            최근 리뷰
                        </h2>

                        {profile.recentReviews.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                아직 작성한 리뷰가 없습니다.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {profile.recentReviews.map((review) => (
                                    <Link
                                        key={review.reviewId}
                                        href={`/places/${review.placeId}`}
                                        className="block rounded-2xl border border-gray-100 p-4 transition hover:bg-gray-50"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-semibold text-gray-950">
                                                {review.placeName}
                                            </p>

                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                                ⭐ {review.rating}
                                            </span>
                                        </div>

                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                                            {review.content}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* <Link href="/my/titles"> */}
                      <Card className="transition hover:bg-gray-50">
                          <p className="text-sm font-semibold text-gray-500">
                              보유 칭호
                          </p>

                          <p className="mt-2 text-2xl font-bold text-gray-950">
                              {profile.titleCount}
                          </p>
                      </Card>
                  {/* </Link> */}

                    {/* <Link href="/my/achievements"> */}
                      <Card className="transition hover:bg-gray-50">
                          <p className="text-sm font-semibold text-gray-500">
                              달성 업적
                          </p>

                          <p className="mt-2 text-2xl font-bold text-gray-950">
                              {profile.achievementCount}
                          </p>
                      </Card>
                  {/* </Link> */}
                </div>
            </section>
            
            {/* <ActivityLogSection /> */}
        </MainLayout>

    );
}
"use client";

import { useParams } from "next/navigation";

import { MainLayout } from "@/layouts/MainLayout";
import { Card } from "@/components/common/Card";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";

import { useAnchorDetail } from "@/hooks/useAnchorDetail";

export default function AnchorDetailPage() {
    const params = useParams();
    const anchorId = Number(params.anchorId);

    const {
        data: anchor,
        isLoading,
        isError,
    } = useAnchorDetail(anchorId);

    return (
        <MainLayout>
            {isLoading && (
                <LoadingState message="Anchor 정보를 불러오는 중입니다..." />
            )}

            {isError && (
                <ErrorState
                    title="Anchor 상세 조회 실패"
                    message="Anchor 정보를 불러오지 못했습니다."
                />
            )}

            {anchor && (
                <section className="space-y-6">
                    <Card className="p-8">
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                            <div>
                                <p className="text-sm font-semibold text-gray-500">
                                    Anchor
                                </p>

                                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                                    {anchor.title}
                                </h1>

                                <p className="mt-4 text-sm leading-6 text-gray-600">
                                    {anchor.basePlaceName ?? "기준 장소 없음"}
                                </p>

                                <p className="mt-2 text-sm text-gray-500">
                                    {anchor.baseAddress ?? "기준 주소 없음"}
                                </p>
                            </div>

                            <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                                {anchor.isPublic ? "공개" : "비공개"}
                            </span>
                        </div>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <p className="text-sm font-semibold text-gray-500">
                                조회수
                            </p>
                            <p className="mt-2 text-2xl font-bold text-gray-950">
                                {anchor.viewCount.toLocaleString()}
                            </p>
                        </Card>

                        <Card>
                            <p className="text-sm font-semibold text-gray-500">
                                좋아요
                            </p>
                            <p className="mt-2 text-2xl font-bold text-gray-950">
                                {anchor.likeCount.toLocaleString()}
                            </p>
                        </Card>

                        <Card>
                            <p className="text-sm font-semibold text-gray-500">
                                탐색 반경
                            </p>
                            <p className="mt-2 text-2xl font-bold text-gray-950">
                                {anchor.radiusKm ?? "-"}km
                            </p>
                        </Card>
                    </div>

                    <Card>
                        <h2 className="text-xl font-bold text-gray-950">
                            기준 위치
                        </h2>

                        <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                            <div>
                                <dt className="font-semibold text-gray-500">
                                    위도
                                </dt>
                                <dd className="mt-1 text-gray-900">
                                    {anchor.baseLat ?? "-"}
                                </dd>
                            </div>

                            <div>
                                <dt className="font-semibold text-gray-500">
                                    경도
                                </dt>
                                <dd className="mt-1 text-gray-900">
                                    {anchor.baseLon ?? "-"}
                                </dd>
                            </div>
                        </dl>
                    </Card>
                </section>
            )}
        </MainLayout>
    );
}
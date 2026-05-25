"use client";

import { useParams } from "next/navigation";

import { MainLayout } from "@/layouts/MainLayout";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { ReviewListSection } from "@/components/review/ReviewListSection";

import { usePlaceDetail } from "@/hooks/usePlaceDetail";
import {
  useAddPlaceBookmark,
  useRemovePlaceBookmark,
} from "@/hooks/usePlaceBookmark";
import { ReviewCreateForm } from "@/components/review/ReviewCreateForm";

export default function PlaceDetailPage() {
  const params = useParams();
  const placeId = Number(params.placeId);

  const {
    data: place,
    isLoading,
    isError,
  } = usePlaceDetail(placeId);

  const addBookmarkMutation = useAddPlaceBookmark(placeId);
  const removeBookmarkMutation = useRemovePlaceBookmark(placeId);

  const isBookmarkLoading =
    addBookmarkMutation.isPending || removeBookmarkMutation.isPending;

  function handleToggleBookmark() {
    if (!place) {
      return;
    }

    if (place.isBookmarked) {
      removeBookmarkMutation.mutate();
      return;
    }

    addBookmarkMutation.mutate();
  }

  return (
    <MainLayout>
      {isLoading && (
        <LoadingState message="장소 정보를 불러오는 중입니다..." />
      )}

      {isError && (
        <ErrorState
          title="장소 상세 조회 실패"
          message="장소 정보를 불러오지 못했습니다."
        />
      )}

      {place && (
        <section className="space-y-6">
          <Card className="p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  {place.indsMclsNm} · {place.indsSclsNm}
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                  {place.bizesNm}
                  {place.brchNm && (
                    <span className="ml-2 text-lg font-medium text-gray-500">
                      {place.brchNm}
                    </span>
                  )}
                </h1>

                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {place.rdnmAdr || place.lnoAdr || "주소 정보 없음"}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  {place.ctprvnNm} {place.signguNm} {place.adongNm}
                </p>
              </div>

              <Button
                type="button"
                variant={place.isBookmarked ? "secondary" : "primary"}
                disabled={isBookmarkLoading}
                onClick={handleToggleBookmark}
              >
                {isBookmarkLoading
                  ? "처리 중..."
                  : place.isBookmarked
                    ? "저장됨"
                    : "저장하기"}
              </Button>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <p className="text-sm font-semibold text-gray-500">
                평균 평점
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-950">
                {place.averageRating.toFixed(1)}
              </p>
            </Card>

            <Card>
              <p className="text-sm font-semibold text-gray-500">
                리뷰 수
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-950">
                {place.reviewCount.toLocaleString()}
              </p>
            </Card>

            <Card>
              <p className="text-sm font-semibold text-gray-500">
                위치
              </p>
              <p className="mt-2 text-sm text-gray-700">
                {place.lat}, {place.lon}
              </p>
            </Card>
          </div>

          <Card>
            <h2 className="text-xl font-bold text-gray-950">
              상세 정보
            </h2>

            <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <dt className="font-semibold text-gray-500">
                  상권업종 대분류
                </dt>
                <dd className="mt-1 text-gray-900">
                  {place.indsLclsNm}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-gray-500">
                  상권업종 중분류
                </dt>
                <dd className="mt-1 text-gray-900">
                  {place.indsMclsNm}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-gray-500">
                  상권업종 소분류
                </dt>
                <dd className="mt-1 text-gray-900">
                  {place.indsSclsNm}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-gray-500">
                  우편번호
                </dt>
                <dd className="mt-1 text-gray-900">
                  {place.newZipcd || "-"}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-950">
                  이 장소를 기준으로 Anchor 만들기
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  이 장소를 기준점으로 주변 장소를 묶어 나만의 경험 코스를 만들 수 있습니다.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => {
                  const query = new URLSearchParams({
                    basePlaceId: String(place.id),
                    basePlaceName: place.bizesNm,
                    baseAddress: place.rdnmAdr || place.lnoAdr || "",
                    baseLon: String(place.lon),
                    baseLat: String(place.lat),
                  });

                  window.location.href = `/anchors/create?${query.toString()}`;
                }}
              >
                Anchor 만들기
              </Button>
            </div>
          </Card>

          <ReviewCreateForm placeId={placeId} />

          <ReviewListSection placeId={placeId} />
        </section>
      )}
    </MainLayout>
  );
}
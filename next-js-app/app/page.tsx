import { MainLayout } from "@/layouts/MainLayout";

export default function HomePage() {
  return (
    <MainLayout>
      <section className="rounded-3xl bg-gray-50 p-10">
        <p className="mb-3 text-sm font-semibold text-gray-500">
          Discover All The Town
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-gray-950">
          어디에 닻을 내릴까요?
        </h1>

        <p className="mt-4 max-w-xl text-gray-600">
          DATT는 특정 지역을 기준으로 맛집, 카페, 술집, 숙소, 놀거리를
          한 번에 탐색할 수 있는 경험 큐레이션 서비스입니다.
        </p>
      </section>
    </MainLayout>
  );
}
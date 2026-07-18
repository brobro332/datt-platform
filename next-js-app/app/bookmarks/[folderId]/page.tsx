"use client";

import { useParams } from "next/navigation";
import { MainLayout } from "@/layouts/MainLayout";
import { Card } from "@/components/common/Card";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { usePublicBookmarkFolder } from "@/hooks/usePlaceBookmark";
import { PlaceThumbnail } from "@/components/common/PlaceThumbnail";
import { getCategoryFromText } from "@/utils/category";
import { MapPin, Folder, ChevronRight, Compass } from "lucide-react";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import Link from "next/link";

export default function PublicBookmarkFolderPage() {
  const params = useParams();
  const folderId = Number(params.folderId);

  const { data, isLoading, isError } = usePublicBookmarkFolder(folderId);

  return (
    <MainLayout>
      <section className="space-y-8 pb-32">
        {/* Header Hero Card */}
        <div className="rounded-[2.5rem] border border-slate-200/50 bg-white/80 p-8 md:p-10 shadow-sm backdrop-blur-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-indigo-500 fill-indigo-100" /> Shared Folder
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
                {data ? `${data.ownerNickname}님의 [${data.folderName}]` : "공유된 보관함"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-xl font-semibold">
                DATT에서 특별히 엄선하고 스크랩한 핫플레이스 공유 폴더입니다. 아래 저장된 장소 정보를 만나보세요.
              </p>
            </div>
            <Link href="/" className="shrink-0">
              <button className="h-10 rounded-xl px-4 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition active:scale-95 flex items-center gap-1 cursor-pointer">
                <Compass className="w-3.5 h-3.5" /> DATT 탐험하러 가기
              </button>
            </Link>
          </div>
        </div>

        <AsyncStateView
          isLoading={isLoading}
          isError={isError}
          isEmpty={!data || data.bookmarks.length === 0}
          loadingMessage="공유된 보관함 장소를 불러오는 중입니다..."
          errorTitle="보관함 조회 실패"
          errorMessage="공유 링크가 잘못되었거나 삭제된 보관함입니다."
          emptyTitle="저장된 장소가 없는 보관함입니다."
          emptyDescription="폴더가 비어 있습니다."
        >
          {data && (
            <div className="grid gap-6 sm:grid-cols-2">
              {data.bookmarks.map((bookmark) => {
                const cat = getCategoryFromText(bookmark.indsMclsNm, "");
                return (
                  <Link href={`/place-search/${bookmark.placeId}`} key={bookmark.bookmarkId}>
                    <Card className="p-5 flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all duration-300 group border border-slate-200/50 bg-white/80 backdrop-blur-sm relative overflow-hidden h-full">
                      <PlaceThumbnail placeId={bookmark.placeId} indsMclsNm={bookmark.indsMclsNm} className="h-16 w-16 rounded-2xl shrink-0" />

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CategoryBadge category={cat} />
                          <span className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                            {bookmark.indsMclsNm}
                          </span>
                        </div>

                        <h3 className="truncate text-base font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {bookmark.bizesNm}
                          {bookmark.brchNm && (
                            <span className="ml-1 text-xs font-semibold text-slate-400">
                              {bookmark.brchNm}
                            </span>
                          )}
                        </h3>

                        <p className="truncate text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {bookmark.ctprvnNm} {bookmark.signguNm} {bookmark.adongNm}
                        </p>
                      </div>

                      <div className="text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </AsyncStateView>
      </section>
    </MainLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MainLayout } from "@/layouts/MainLayout";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { AsyncStateView } from "@/components/common/AsyncStateView";

import { useMyPlaceBookmarks, useRemovePlaceBookmark, useGetBookmarkFolders } from "@/hooks/usePlaceBookmark";
import { PlaceThumbnail } from "@/components/common/PlaceThumbnail";
import { getCategoryFromText, type PlaceCategory } from "@/utils/category";
import type { PlaceBookmarkResponse, BookmarkFolder } from "@/types/bookmark";
import { MapPin, Search, ExternalLink, Trash2, Bookmark, Folder, Share2, Copy, X } from "lucide-react";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { env } from "@/lib/env";

const PAGE_SIZE = 6;

export default function MyBookmarksPage() {
  const [page, setPage] = useState(0);
  const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>(undefined);

  const { data: folders = [] } = useGetBookmarkFolders();
  const { data, isLoading, isError } = useMyPlaceBookmarks(page, PAGE_SIZE, selectedFolderId);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const initKakao = () => {
    if (typeof window !== "undefined") {
      const Kakao = (window as any).Kakao;
      if (Kakao) {
        if (!Kakao.isInitialized()) {
          Kakao.init(env.kakaoMapAppKey);
        }
        return Kakao;
      }
    }
    return null;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!(window as any).Kakao) {
        const script = document.createElement("script");
        script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
        script.onload = () => {
          initKakao();
        };
        document.head.appendChild(script);
      } else {
        initKakao();
      }
    }
  }, []);

  const shareToKakao = () => {
    const Kakao = initKakao();
    if (Kakao && Kakao.Share) {
      try {
        const selectedFolder = folders.find(f => f.id === selectedFolderId);
        const folderName = selectedFolder ? selectedFolder.name : "보관함";
        const shareUrl = window.location.origin + `/bookmarks/${selectedFolderId}`;
        Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: `DATT [${folderName}] 보관함 공유`,
            description: "DATT에서 특별히 큐레이션한 맛집/핫플레이스 공유 폴더를 확인해 보세요.",
            imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60",
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
          buttons: [
            {
              title: "보관함 확인하기",
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
          ],
        });
        setIsShareModalOpen(false);
      } catch (err) {
        console.error("Kakao share failed:", err);
        alert("카카오톡 공유에 실패했습니다. 링크 복사를 이용해 주세요.");
      }
    } else {
      alert("카카오톡 SDK 로딩 중입니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = window.location.origin + `/bookmarks/${selectedFolderId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("공유 링크가 클립보드에 복사되었습니다!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      alert("링크 복사에 실패했습니다. 주소창의 주소를 직접 복사해 주세요.");
    }
  };

  function handlePreviousPage() {
    setPage((prev) => Math.max(prev - 1, 0));
  }

  function handleNextPage() {
    if (data && !data.last) {
      setPage((prev) => prev + 1);
    }
  }

  const displayBookmarks = data ? data.content : [];

  return (
    <MainLayout requireAuth>
      <section className="space-y-8 pb-32">
        {/* Header Hero Card */}
        <div className="rounded-[2.5rem] border border-slate-200/50 bg-white/80 p-8 md:p-10 shadow-sm backdrop-blur-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-blue-500" /> My Places
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">저장한 장소</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-xl font-semibold">
                탐색하면서 보관해둔 나만의 핫플레이스 목록입니다. 즐겨찾는 폴더별로 정돈하여 확인해 보세요.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selectedFolderId !== undefined && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="h-10 rounded-xl px-4 text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-750 hover:bg-indigo-100 transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" /> 공유
                </button>
              )}
              <Link href="/place-search">
                <Button size="md" className="rounded-xl shadow-md flex items-center gap-1.5">
                  <Search className="w-4 h-4" /> 새로운 장소 찾기
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bookmark Folder Filtering Chips */}
        {folders.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pb-2">
            <button
              onClick={() => {
                setSelectedFolderId(undefined);
                setPage(0);
              }}
              className={`px-4.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                selectedFolderId === undefined
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-white/80 border border-slate-200/50 text-slate-500 hover:text-slate-700 hover:bg-white"
              }`}
            >
              전체 보기
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => {
                  setSelectedFolderId(folder.id);
                  setPage(0);
                }}
                className={`px-4.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedFolderId === folder.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "bg-white/80 border border-slate-200/50 text-slate-500 hover:text-slate-700 hover:bg-white"
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                {folder.name}
              </button>
            ))}
          </div>
        )}

        <AsyncStateView
          isLoading={isLoading}
          isError={isError}
          isEmpty={Boolean(data?.empty)}
          loadingMessage="저장한 장소 목록을 불러오는 중입니다..."
          errorTitle="저장소 조회 실패"
          errorMessage="목록 정보를 불러오지 못했습니다. 다시 시도해 주세요."
          emptyTitle="저장한 장소가 없습니다."
          emptyDescription="장소 검색에서 맘에 드는 곳을 저장해 보세요!"
        >
          {data && (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {displayBookmarks.map((bookmark) => (
                  <BookmarkListItem key={bookmark.bookmarkId} bookmark={bookmark} />
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="mt-8 flex items-center justify-between">
                <p className="text-xs font-black text-slate-450">
                  {data.number + 1} / {data.totalPages} 페이지
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePreviousPage}
                    disabled={data.first}
                    className="px-5 h-10 rounded-xl text-xs font-black border border-slate-200 bg-white/80 text-slate-700 shadow-sm transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 cursor-pointer"
                  >
                    이전
                  </button>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={data.last}
                    className="px-5 h-10 rounded-xl text-xs font-black border border-slate-200 bg-white/80 text-slate-700 shadow-sm transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 cursor-pointer"
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          )}
        </AsyncStateView>
      </section>

      {/* Share Modal */}
      {isShareModalOpen && selectedFolderId !== undefined && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-[2rem] border border-white/50 bg-white/95 p-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-650" /> 보관함 폴더 공유
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              선택한 보관함 폴더를 친구들과 함께 공유해보세요.
            </p>

            <div className="mt-6 space-y-3">
              <button
                onClick={shareToKakao}
                className="w-full h-12 rounded-xl bg-[#FEE500] hover:bg-[#FDD835] text-slate-900 font-bold text-sm transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-yellow-300"
              >
                <span className="text-sm font-black">💬 카카오톡 공유</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Copy className="w-4 h-4" /> 링크 주소 복사
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

function BookmarkListItem({ bookmark }: { bookmark: PlaceBookmarkResponse }) {
  const removeBookmarkMutation = useRemovePlaceBookmark(bookmark.placeId);

  const handleUnsave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`"${bookmark.bizesNm}" 장소를 저장 목록에서 삭제하시겠습니까?`)) {
      try {
        await removeBookmarkMutation.mutateAsync();
      } catch (err) {
        console.error(err);
        alert("삭제에 실패했습니다.");
      }
    }
  };

  const cat = getCategoryFromText(bookmark.indsMclsNm, "");

  return (
    <Card className="p-5 flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all duration-300 group border border-slate-200/50 bg-white/80 backdrop-blur-sm relative overflow-hidden">
      <PlaceThumbnail placeId={bookmark.placeId} indsMclsNm={bookmark.indsMclsNm} className="h-16 w-16 rounded-2xl shrink-0" />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={cat} />
          <span className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
            {bookmark.indsMclsNm}
          </span>
        </div>

        <h3 className="truncate text-base font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">
          <Link href={`/place-search/${bookmark.placeId}`}>
            {bookmark.bizesNm}
          </Link>
          {bookmark.brchNm && (
            <span className="ml-1 text-xs font-semibold text-slate-400">
              {bookmark.brchNm}
            </span>
          )}
        </h3>

        <p className="truncate text-xs font-semibold text-slate-500 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {bookmark.ctprvnNm} {bookmark.signguNm} {bookmark.adongNm}
        </p>

        {/* Folders badges */}
        {bookmark.folders && bookmark.folders.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {bookmark.folders.map((folder: BookmarkFolder) => (
              <span key={folder.id} className="rounded bg-indigo-50/60 border border-indigo-100/30 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 flex items-center gap-1">
                <Folder className="w-2.5 h-2.5 fill-indigo-500 text-indigo-500" /> {folder.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 shrink-0 ml-2">
        <Link
          href={`/place-search/${bookmark.placeId}`}
          className="rounded-xl border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-white shadow-sm transition hover:border-indigo-500 hover:text-indigo-600 text-center active:scale-95 flex items-center justify-center gap-1"
        >
          <ExternalLink className="w-3 h-3" /> 상세
        </Link>
        <button
          type="button"
          onClick={handleUnsave}
          disabled={removeBookmarkMutation.isPending}
          className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-[10px] font-bold text-rose-600 shadow-sm transition hover:bg-rose-100 hover:text-rose-700 text-center active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> 해제
        </button>
      </div>
    </Card>
  );
}
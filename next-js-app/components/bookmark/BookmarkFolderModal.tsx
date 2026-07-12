"use client";

import { useState, useEffect } from "react";
import {
  useGetBookmarkFolders,
  useCreateBookmarkFolder,
  useUpdateBookmarkFolder,
  useDeleteBookmarkFolder,
} from "@/hooks/usePlaceBookmark";

type BookmarkFolderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  placeId: number;
  isBookmarked: boolean;
  currentFolders?: { id: number; name: string }[];
  onSelectFolders: (folderIds: number[]) => Promise<void>;
  onUnsave: () => Promise<void>;
  isActionLoading: boolean;
};

export function BookmarkFolderModal({
  isOpen,
  onClose,
  placeId,
  isBookmarked,
  currentFolders = [],
  onSelectFolders,
  onUnsave,
  isActionLoading,
}: BookmarkFolderModalProps) {
  const { data: folders = [], isLoading: isFoldersLoading } =
    useGetBookmarkFolders();
  const createFolderMutation = useCreateBookmarkFolder();
  const updateFolderMutation = useUpdateBookmarkFolder();
  const deleteFolderMutation = useDeleteBookmarkFolder();

  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  const safeFolders = currentFolders || [];

  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedFolderIds(safeFolders.map((f) => f.id));
    }
  }, [isOpen, currentFolders]);

  // If bookmarked and folders list is empty, it means it is saved in the default (root) folder
  const isSavedInDefault = isBookmarked && selectedFolderIds.length === 0;

  if (!isOpen) return null;

  console.log("DEBUG BookmarkFolderModal:", {
    isBookmarked,
    safeFolders,
    selectedFolderIds,
    isSavedInDefault
  });

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    createFolderMutation.mutate(newFolderName.trim(), {
      onSuccess: () => {
        setNewFolderName("");
      },
    });
  };

  const handleStartRename = (folderId: number, currentName: string) => {
    setEditingFolderId(folderId);
    setEditingFolderName(currentName);
  };

  const handleSaveRename = (folderId: number) => {
    if (!editingFolderName.trim()) return;
    updateFolderMutation.mutate(
      { folderId, name: editingFolderName.trim() },
      {
        onSuccess: () => {
          setEditingFolderId(null);
        },
      }
    );
  };

  const handleDeleteFolder = (e: React.MouseEvent, folderId: number) => {
    e.stopPropagation();
    if (confirm("이 폴더를 삭제하시겠습니까? 폴더 안의 저장된 장소는 유지됩니다.")) {
      deleteFolderMutation.mutate(folderId);
    }
  };

  const handleToggleDefaultFolder = () => {
    if (isActionLoading) return;
    
    if (isSavedInDefault) {
      // Toggle off default folder when it's already selected -> Unsave entirely
      onUnsave();
    } else {
      // Select default folder -> Clear custom folder selections
      setSelectedFolderIds([]);
      onSelectFolders([]);
    }
  };

  const handleToggleCustomFolder = (folderId: number) => {
    if (isActionLoading) return;

    const isSelected = selectedFolderIds.includes(folderId);

    if (isSelected) {
      if (selectedFolderIds.length === 1 && !isSavedInDefault) {
        // This is the only selected folder -> Unsave entirely
        onUnsave();
      } else {
        // Remove from selection
        const nextIds = selectedFolderIds.filter((id) => id !== folderId);
        setSelectedFolderIds(nextIds);
        onSelectFolders(nextIds);
      }
    } else {
      // Add to selection
      const nextIds = [...selectedFolderIds, folderId];
      setSelectedFolderIds(nextIds);
      onSelectFolders(nextIds);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white/95 dark:bg-zinc-900/95 rounded-[2rem] border border-white/20 dark:border-zinc-800/50 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              저장 폴더 선택
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              이 장소를 저장할 폴더를 모두 지정해 주세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Folder List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px] max-h-[350px]">
          {isFoldersLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
              <span className="text-xs text-slate-400">폴더 목록 로딩 중...</span>
            </div>
          ) : (
            <>
              {/* Default Root / No Folder Option */}
              <div
                onClick={handleToggleDefaultFolder}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 select-none ${
                  isSavedInDefault
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20"
                    : "border-slate-100 dark:border-zinc-800/60 hover:bg-slate-50 dark:hover:bg-zinc-800/30"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    isSavedInDefault
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 dark:border-zinc-700 bg-transparent"
                  }`}>
                    {isSavedInDefault && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                      기본 저장 폴더
                    </p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                      폴더 미지정시 기본 저장 공간
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Folders */}
              {folders.map((folder) => {
                const isEditing = editingFolderId === folder.id;
                const isSelected = selectedFolderIds.includes(folder.id);

                return (
                  <div
                    key={folder.id}
                    onClick={() => !isEditing && handleToggleCustomFolder(folder.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 select-none ${
                      isEditing ? "cursor-default" : "cursor-pointer"
                    } ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20"
                        : "border-slate-100 dark:border-zinc-800/60 hover:bg-slate-50 dark:hover:bg-zinc-800/30"
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 mr-2 min-w-0">
                      {!isEditing && (
                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300 dark:border-zinc-700 bg-transparent"
                        }`}>
                          {isSelected && (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      )}
                      <span className="text-xl shrink-0">📂</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingFolderName}
                          onChange={(e) => setEditingFolderName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(folder.id);
                            if (e.key === "Escape") setEditingFolderId(null);
                          }}
                          className="flex-1 text-sm font-bold text-slate-800 dark:text-zinc-200 bg-transparent border-b border-indigo-500 focus:outline-none py-0.5"
                          autoFocus
                          maxLength={50}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">
                          {folder.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveRename(folder.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEditingFolderId(null)}
                            className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartRename(folder.id, folder.name)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleDeleteFolder(e, folder.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Add Folder Inline Input */}
        <form
          onSubmit={handleCreateFolder}
          className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="새 폴더 이름 입력"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            disabled={createFolderMutation.isPending}
            maxLength={50}
            className="flex-1 h-10 px-4 rounded-xl text-sm border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={createFolderMutation.isPending || !newFolderName.trim()}
            className="h-10 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center justify-center shrink-0"
          >
            {createFolderMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "폴더 추가"
            )}
          </button>
        </form>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col space-y-2">
          <button
            onClick={onClose}
            className="w-full h-11 text-sm font-bold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/30 active:scale-98 rounded-2xl transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

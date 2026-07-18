"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { getAdsByAdmin, createAdByAdmin, deleteAdByAdmin, uploadAdImage, AdResponse } from "@/services/adService";
import { Image as ImageIcon, Plus, Trash2, Link as LinkIcon, Calendar, CheckCircle2, AlertCircle, X, Upload } from "lucide-react";

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Create Form States
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch Ads

  const handleFetchAds = async () => {
    setIsLoading(true);
    try {
      const data = await getAdsByAdmin();
      setAds(data);
    } catch (error) {
      console.error("Failed to fetch ads", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFetchAds();
  }, []);

  // Image Selection Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete Ad Handler
  const handleDeleteAd = async (adId: number) => {
    if (!confirm("정말 이 광고 배너를 삭제하시겠습니까?")) return;

    try {
      await deleteAdByAdmin(adId);
      setAds((prev) => prev.filter((ad) => ad.id !== adId));
      setMessage({ type: "success", text: "광고 배너가 성공적으로 삭제되었습니다." });
    } catch (error) {
      console.error("Failed to delete ad", error);
      setMessage({ type: "error", text: "광고 배너 삭제 중 오류가 발생했습니다." });
    }
  };

  // Submit Ad Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !linkUrl.trim() || !imageFile) {
      setMessage({ type: "error", text: "모든 필수 항목을 기입하고 이미지를 업로드해 주세요." });
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);
    setMessage(null);

    try {
      // 1. Upload Image File First
      const imageUrl = await uploadAdImage(imageFile);
      setIsUploading(false);

      // 2. Create Advertisement Entry
      await createAdByAdmin({
        title: title.trim(),
        linkUrl: linkUrl.trim(),
        imageUrl,
      });

      setMessage({ type: "success", text: "신규 광고 배너가 성공적으로 등록되었습니다!" });
      
      // Close Modal & Reset Form
      setIsModalOpen(false);
      setTitle("");
      setLinkUrl("");
      setImageFile(null);
      setImagePreview(null);
      
      // Refetch
      handleFetchAds();
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || "광고 배너 저장 중 오류가 발생했습니다.";
      setMessage({ type: "error", text: errMsg });
      setIsUploading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-indigo-400" /> 광고 관리
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-semibold">
            DATT 서비스 내에 노출할 프로모션 배너 및 스폰서 광고 링크를 관리합니다.
          </p>
        </div>
        <Button
          onClick={() => {
            setIsModalOpen(true);
            setMessage(null);
          }}
          className="flex items-center gap-1.5 h-11 px-5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> 광고 배너 추가
        </Button>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 mb-6 rounded-2xl flex items-start gap-3 border shadow-sm ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-900 text-emerald-300"
              : "bg-rose-950/40 border-rose-900 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-455 shrink-0 mt-0.5" />
          )}
          <p className="text-xs font-bold">{message.text}</p>
        </div>
      )}

      {/* Loader */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500 font-semibold text-xs">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>광고 배너 목록을 불러오는 중...</span>
        </div>
      ) : ads.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-slate-800 border-dashed text-slate-500 font-bold bg-slate-900/20">
          <ImageIcon className="w-12 h-12 mx-auto text-slate-700 mb-3" />
          등록된 광고 배너가 없습니다.
        </div>
      ) : (
        /* Ad Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md flex flex-col group transition-all duration-300 hover:border-slate-700"
            >
              {/* Ad Image Container */}
              <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider uppercase bg-emerald-600/90 text-white backdrop-blur-sm">
                  {ad.status}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAd(ad.id)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:bg-rose-950/90 hover:text-rose-400 backdrop-blur-sm transition cursor-pointer"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Ad Content */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white line-clamp-1 mb-1">
                    {ad.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                    <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate max-w-[200px]" title={ad.linkUrl}>{ad.linkUrl}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold border-t border-slate-800 pt-3.5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  등록일: {new Date(ad.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Ad Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => {
              if (!isSubmitting) setIsModalOpen(false);
            }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-indigo-400" /> 신규 광고 배너 등록
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (!isSubmitting) setIsModalOpen(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Ad Title */}
              <div>
                <label htmlFor="adTitle" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  광고 제목 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="adTitle"
                  type="text"
                  required
                  placeholder="예: 7월 브랜드 위크 프로모션 배너"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-xs font-bold text-slate-200 placeholder-slate-500 outline-none transition focus:border-indigo-500"
                />
              </div>

              {/* Link URL */}
              <div>
                <label htmlFor="adLinkUrl" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  연결 링크 URL <span className="text-rose-500">*</span>
                </label>
                <input
                  id="adLinkUrl"
                  type="url"
                  required
                  placeholder="예: https://datt-platform.com/events/brand-week"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-xs font-bold text-slate-200 placeholder-slate-500 outline-none transition focus:border-indigo-500"
                />
              </div>

              {/* Image Upload Zone */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  배너 이미지 <span className="text-rose-500">*</span>
                </label>
                
                {imagePreview ? (
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="aspect-[16/9] w-full rounded-2xl border-2 border-slate-800 border-dashed bg-slate-950 flex flex-col items-center justify-center gap-2 group-hover:border-indigo-500 transition-colors">
                      <Upload className="w-8 h-8 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-300">
                        클릭하여 이미지 업로드 (추천 비율 16:9)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl shadow-lg shadow-indigo-600/10 cursor-pointer mt-4"
              >
                {isSubmitting
                  ? isUploading
                    ? "이미지 파일 업로드 중..."
                    : "광고 정보 등록 중..."
                  : "광고 등록"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

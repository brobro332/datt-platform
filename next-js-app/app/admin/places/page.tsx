"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { geocodeAddress, createPlaceByAdmin } from "@/services/placeService";
import { MapPin, PlusCircle, CheckCircle, AlertTriangle } from "lucide-react";

export default function AdminPlacesPage() {
  // Form States
  const [bizesNm, setBizesNm] = useState("");
  const [brchNm, setBrchNm] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [searchAddress, setSearchAddress] = useState("");
  
  // Geocoding States
  const [rdnmAdr, setRdnmAdr] = useState("");
  const [lnoAdr, setLnoAdr] = useState("");
  const [lon, setLon] = useState<number | "">("");
  const [lat, setLat] = useState<number | "">("");
  const [ctprvnNm, setCtprvnNm] = useState("");
  const [signguNm, setSignguNm] = useState("");
  const [adongNm, setAdongNm] = useState("");

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Geocode Address Handler
  const handleGeocode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchAddress.trim()) {
      setMessage({ type: "error", text: "변환할 주소를 입력해 주세요." });
      return;
    }

    setIsGeocoding(true);
    setMessage(null);

    try {
      const data = await geocodeAddress(searchAddress.trim());
      setRdnmAdr(data.roadAddressName || data.addressName);
      setLnoAdr(data.jibunAddressName || data.addressName);
      setLon(data.longitude);
      setLat(data.latitude);
      setCtprvnNm(data.ctprvnNm);
      setSignguNm(data.signguNm);
      setAdongNm(data.adongNm);

      setMessage({ type: "success", text: "주소 좌표 변환 성공! 🗺️ 위경도 및 지역 정보가 반영되었습니다." });
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || "주소를 좌표로 변환하는 데 실패했습니다. 올바른 주소인지 확인해 주세요.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setIsGeocoding(false);
    }
  };

  // Submit New Place Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizesNm.trim()) {
      setMessage({ type: "error", text: "상호명을 입력해 주세요." });
      return;
    }
    if (!rdnmAdr || !lnoAdr || !lon || !lat || !ctprvnNm || !signguNm || !adongNm) {
      setMessage({ type: "error", text: "먼저 주소를 입력하고 '좌표 변환'을 완료해 주세요." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await createPlaceByAdmin({
        bizesNm: bizesNm.trim(),
        brchNm: brchNm.trim() || undefined,
        category,
        rdnmAdr,
        lnoAdr,
        lon: Number(lon),
        lat: Number(lat),
        ctprvnNm,
        signguNm,
        adongNm,
      });

      setMessage({ type: "success", text: `"${bizesNm}" 장소가 성공적으로 등록되었습니다! 🎉` });
      
      // Reset Form
      setBizesNm("");
      setBrchNm("");
      setSearchAddress("");
      setRdnmAdr("");
      setLnoAdr("");
      setLon("");
      setLat("");
      setCtprvnNm("");
      setSignguNm("");
      setAdongNm("");
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || "장소 등록 중 문제가 발생했습니다.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <PlusCircle className="w-7 h-7 text-indigo-400" /> 매장 등록
          </h1>
          <p className="text-slate-450 text-xs mt-1 font-semibold">
            DATT 상권 데이터에 수동으로 장소를 추가하고 위도/경도를 실시간으로 자동 맵핑합니다.
          </p>
        </div>
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
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-455 shrink-0 mt-0.5" />
          )}
          <p className="text-xs font-bold">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Form: Input Info */}
        <div className="md:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-md">
          <h2 className="text-base font-extrabold text-slate-200 mb-6">1. 기본 정보 입력</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                카테고리 선택
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { key: "FOOD", label: "맛집" },
                  { key: "CAFE", label: "카페" },
                  { key: "BAR", label: "술집" },
                  { key: "STAY", label: "숙소" },
                  { key: "PLAY", label: "놀거리" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setCategory(opt.key)}
                    className={`h-10 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      category === opt.key
                        ? "bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/20"
                        : "bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-750"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Place Name */}
            <div>
              <label htmlFor="bizesNm" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                상호명 <span className="text-rose-500">*</span>
              </label>
              <input
                id="bizesNm"
                type="text"
                required
                placeholder="예: DATT 라운지"
                value={bizesNm}
                onChange={(e) => setBizesNm(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-xs font-bold text-slate-250 placeholder-slate-500 outline-none transition focus:border-indigo-500"
              />
            </div>

            {/* Branch Name */}
            <div>
              <label htmlFor="brchNm" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                지점명
              </label>
              <input
                id="brchNm"
                type="text"
                placeholder="예: 강남점 (비워둬도 무방)"
                value={brchNm}
                onChange={(e) => setBrchNm(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-xs font-bold text-slate-250 placeholder-slate-500 outline-none transition focus:border-indigo-500"
              />
            </div>

            {/* Readonly Address & Coordinates Form */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-300">2. 매칭된 위치 정보</h3>
              
              {/* Coordinates Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                    위도 (Latitude)
                  </label>
                  <input
                    type="text"
                    readOnly
                    placeholder="주소 변환 시 자동 입력"
                    value={lat}
                    className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950/40 px-4 text-xs font-semibold text-slate-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                    경도 (Longitude)
                  </label>
                  <input
                    type="text"
                    readOnly
                    placeholder="주소 변환 시 자동 입력"
                    value={lon}
                    className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950/40 px-4 text-xs font-semibold text-slate-500 outline-none"
                  />
                </div>
              </div>

              {/* Road Address */}
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                  도로명 주소
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="주소 변환 시 자동 입력"
                  value={rdnmAdr}
                  className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950/40 px-4 text-xs font-semibold text-slate-500 outline-none"
                />
              </div>

              {/* Jibun Address */}
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                  지번 주소
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="주소 변환 시 자동 입력"
                  value={lnoAdr}
                  className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950/40 px-4 text-xs font-semibold text-slate-500 outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !lat || !lon}
              className="w-full h-12 rounded-2xl shadow-lg shadow-indigo-600/10 cursor-pointer mt-4"
            >
              {isSubmitting ? "장소 등록 중..." : "장소 등록 완료"}
            </Button>
          </form>
        </div>

        {/* Right Panel: Geocoding Finder */}
        <div className="md:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-200 mb-2 flex items-center gap-1.5">
              <MapPin className="w-5 h-5 text-indigo-400" /> 주소 검색 및 변환
            </h2>
            <p className="text-[10px] text-slate-500 font-semibold mb-6">
              카카오 지오코딩 API를 사용해 정확한 좌표 정보와 정규화된 행정구역 주소를 추출합니다.
            </p>

            <form onSubmit={handleGeocode} className="space-y-4">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">🔍</span>
                <input
                  type="text"
                  placeholder="지번 혹은 도로명 주소 입력"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 pl-9 pr-4 text-xs font-bold text-slate-300 placeholder-slate-500 outline-none transition focus:border-indigo-500"
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                disabled={isGeocoding}
                className="w-full h-10 rounded-xl text-xs font-black border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-750 cursor-pointer"
              >
                {isGeocoding ? "좌표 변환 중..." : "주소 좌표 변환"}
              </Button>
            </form>

            {lat && lon && (
              <div className="mt-8 p-4.5 rounded-2xl bg-slate-950 border border-slate-850 shadow-inner space-y-3">
                <h3 className="text-xs font-black text-indigo-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> 추출된 세부 지역 정보
                </h3>
                <ul className="text-xs font-bold text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>시도: {ctprvnNm}</li>
                  <li>시군구: {signguNm}</li>
                  <li>행정동: {adongNm}</li>
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 text-[10px] font-bold text-slate-500">
            💡 가이드: 검색창에 한글 주소를 명확히 기재한 뒤 '주소 좌표 변환'을 실행해야만 왼쪽 폼의 등록 버튼이 활성화됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}

import { useRouter } from "next/navigation";
import type { PlaceSearchResponse } from "@/types/place";
import { PlaceThumbnail } from "@/components/common/PlaceThumbnail";
import { getCategoryFromText, type PlaceCategory } from "@/utils/category";
import { Star, MapPin } from "lucide-react";
import { CategoryBadge } from "@/components/common/CategoryBadge";

type PlaceListItemProps = {
  place: PlaceSearchResponse;
  isSelected?: boolean;
  onClick?: (place: PlaceSearchResponse) => void;
};

export function PlaceListItem({
  place,
  isSelected = false,
  onClick,
}: PlaceListItemProps) {
  const router = useRouter();

  const handleItemClick = () => {
    if (onClick) {
      onClick(place);
    } else {
      router.push(`/place-search/${place.id}`);
    }
  };

  return (
    <li
      className={`overflow-hidden rounded-2xl border border-slate-200/60 bg-white/75 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.04)] hover:border-indigo-200 hover:-translate-y-[2px] transition-all duration-300 ${
        isSelected ? "border-indigo-300 bg-indigo-50/10 shadow-[0_12px_40px_rgba(99,102,241,0.05)]" : ""
      }`}
    >
      <button
        type="button"
        onClick={handleItemClick}
        className="w-full text-left focus:outline-none cursor-pointer px-6 py-5"
      >
        <div className="flex items-center gap-5">
          <PlaceThumbnail placeId={place.id} indsMclsNm={place.indsMclsNm} category={place.category} thumbnailUrl={place.thumbnailUrl} className="h-16 w-16 rounded-[1.25rem] shadow-sm shrink-0" />

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2.5 flex-wrap">
              {(() => {
                const cat = place.category || getCategoryFromText(place.indsMclsNm, "");
                return <CategoryBadge category={cat as PlaceCategory} />;
              })()}
              <span className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-455">
                {place.indsMclsNm}
              </span>

              <span className="text-xs font-semibold text-slate-400">
                {place.ctprvnNm} {place.signguNm} {place.adongNm}
              </span>

              {place.reviewCount > 0 && (
                <span className="text-[10px] font-black text-amber-700 bg-amber-50/60 border border-amber-100/35 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {place.averageRating.toFixed(1)} ({place.reviewCount})
                </span>
              )}
            </div>

            <h3 className="truncate text-lg font-black text-slate-900 leading-tight">
              {place.bizesNm}
              {place.brchNm && (
                <span className="ml-1.5 text-xs font-semibold text-slate-455">
                  {place.brchNm}
                </span>
              )}
            </h3>

            <p className="mt-1.5 truncate text-xs font-semibold text-slate-450 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {place.rdnmAdr || "주소 정보 없음"}
            </p>
          </div>
        </div>
      </button>
    </li>
  );
}
import { useRouter } from "next/navigation";
import type { PlaceMasterSearchResponse } from "@/types/placeMaster";
import { PlaceThumbnail } from "@/components/common/PlaceThumbnail";
import { getCategoryFromText, type PlaceCategory } from "@/utils/category";
import { MapPin } from "lucide-react";
import { CategoryBadge } from "@/components/common/CategoryBadge";

type PlaceMasterListItemProps = {
  placeMaster: PlaceMasterSearchResponse;
};

export function PlaceMasterListItem({
  placeMaster,
}: PlaceMasterListItemProps) {
  const router = useRouter();

  return (
    <li
      className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/75 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.04)] hover:border-indigo-200 hover:-translate-y-[2px] transition-all duration-300"
    >
      <button
        type="button"
        onClick={() => router.push(`/place-search/${placeMaster.id}`)}
        className="w-full text-left focus:outline-none cursor-pointer px-6 py-5"
      >
        <div className="flex items-center gap-5">
          <PlaceThumbnail placeId={placeMaster.id} indsMclsNm={placeMaster.indsMclsNm} category={placeMaster.category} className="h-16 w-16 rounded-[1.25rem] shadow-sm shrink-0" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              {(() => {
                const cat = placeMaster.category || getCategoryFromText(placeMaster.indsMclsNm, "");
                return <CategoryBadge category={cat as PlaceCategory} />;
              })()}
              <span className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-450">
                {placeMaster.indsMclsNm}
              </span>

              <span className="text-xs font-semibold text-slate-400">
                {placeMaster.ctprvnNm} {placeMaster.signguNm}
              </span>
            </div>

            <h3 className="mt-2 text-lg font-black text-slate-900 leading-tight">
              {placeMaster.bizesNm}
              {placeMaster.brchNm && (
                <span className="ml-1.5 text-xs font-semibold text-slate-450">
                  {placeMaster.brchNm}
                </span>
              )}
            </h3>

            <p className="mt-1.5 text-xs font-semibold text-slate-450 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {placeMaster.rdnmAdr}
            </p>
          </div>
        </div>
      </button>
    </li>
  );
}
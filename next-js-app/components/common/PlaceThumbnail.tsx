import { useState } from "react";
import { getCategoryFromText, getPlaceholderDetails, type PlaceCategory } from "@/utils/category";
import { Utensils, Coffee, Beer, Hotel, Ticket, Sparkles, MapPin } from "lucide-react";
import { useLatestReviewImage } from "@/hooks/useLatestReviewImage";
import { apiClient } from "@/lib/apiClient";

type PlaceThumbnailProps = {
  placeId: number;
  indsMclsNm: string;
  indsSclsNm?: string;
  category?: string;
  thumbnailUrl?: string | null;
  className?: string;
};

const CATEGORY_ICONS: Record<PlaceCategory, React.ComponentType<{ className?: string }>> = {
  FOOD: Utensils,
  CAFE: Coffee,
  BAR: Beer,
  STAY: Hotel,
  PLAY: Ticket,
  OTHER: Sparkles,
};

export function PlaceThumbnail({
  placeId,
  indsMclsNm,
  indsSclsNm = "",
  category,
  thumbnailUrl,
  className = "h-14 w-14",
}: PlaceThumbnailProps) {
  const resolvedCategory = (category as PlaceCategory) || getCategoryFromText(indsMclsNm, indsSclsNm);
  const placeholder = getPlaceholderDetails(resolvedCategory);
  const { data: latestImage } = useLatestReviewImage(placeId, !thumbnailUrl);
  const [imgError, setImgError] = useState(false);

  const Icon = CATEGORY_ICONS[resolvedCategory] || Sparkles;

  const activeImage = thumbnailUrl || latestImage;
  const showImage = activeImage && !imgError;

  const handleImageError = async () => {
    setImgError(true);
    if (activeImage) {
      try {
        await apiClient.post("/api/files/report-broken", { imageUrl: activeImage });
      } catch (err) {
        console.error("Failed to report broken image URL:", err);
      }
    }
  };

  return (
    <div
      className={`${className} ${
        showImage ? "" : `bg-gradient-to-br ${placeholder.gradient}`
      } flex items-center justify-center shadow-sm border border-slate-200/40 relative overflow-hidden shrink-0`}
    >
      {showImage ? (
        <img
          src={activeImage || undefined}
          alt="Thumbnail"
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_100%)] pointer-events-none" />
          <Icon className="w-5 h-5 text-slate-500/80 stroke-[2px]" />
        </>
      )}
    </div>
  );
}

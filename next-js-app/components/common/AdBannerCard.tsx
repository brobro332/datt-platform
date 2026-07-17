import { useEffect, useState } from "react";
import { AdItem } from "@/data/adsData";

interface AdBannerCardProps {
  ad: AdItem;
}

export function AdBannerCard({ ad }: AdBannerCardProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    if (ad.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % ad.images.length);
    }, 3000); // 3초마다 이미지 자동 전환

    return () => clearInterval(interval);
  }, [ad.images.length]);

  // themeColor에 맞게 스타일을 매핑합니다.
  const themeColors = {
    indigo: {
      btn: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10",
      gradient: "from-indigo-50/10 to-indigo-50/20",
    },
    blue: {
      btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/10",
      gradient: "from-blue-50/10 to-blue-50/20",
    },
    teal: {
      btn: "bg-teal-600 hover:bg-teal-700 shadow-teal-600/10",
      gradient: "from-teal-50/10 to-teal-50/20",
    },
    rose: {
      btn: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10",
      gradient: "from-rose-50/10 to-rose-50/20",
    },
  };

  const theme = themeColors[ad.themeColor as keyof typeof themeColors] || themeColors.indigo;

  return (
    <aside className="hidden xl:flex w-[240px] shrink-0 sticky top-24 self-start h-[580px] rounded-[2.5rem] border border-slate-200/50 bg-white/70 backdrop-blur-md p-6 shadow-sm flex-col justify-between overflow-hidden group hover:shadow-md transition-all duration-300">
      {/* Premium glowing background overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      <div className="relative z-10 flex flex-col items-center text-center space-y-3.5">
        <div className="flex items-center gap-1.5 justify-center">
          <span className="text-[9px] font-black text-white bg-slate-400 dark:bg-slate-500 px-1.5 py-0.5 rounded-md tracking-wider">
            AD
          </span>
          {ad.badge && (
            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-md">
              {ad.badge}
            </span>
          )}
        </div>

        <h4 className="text-sm font-black text-slate-800 leading-snug whitespace-pre-line">
          {ad.title}
        </h4>

        <p className="text-[10px] font-semibold text-slate-450 leading-relaxed">
          {ad.description}
        </p>
      </div>

      <div className="relative z-10 space-y-4 flex-1 flex flex-col justify-end mt-4">
        {/* Carousel Image Area */}
        <div className="flex-1 rounded-2xl border border-slate-200/30 overflow-hidden relative group/img shadow-inner min-h-[220px]">
          {ad.images.map((imgUrl, idx) => (
            <img
              key={idx}
              src={imgUrl}
              alt={`${ad.title} image ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-contain bg-slate-50/60 group-hover/img:scale-105 transition-all duration-1000 ease-in-out ${
                idx === currentImgIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            />
          ))}

          {/* Text Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent flex flex-col justify-end p-4 z-20">
            {ad.emoji && <span className="text-[18px] mb-1">{ad.emoji}</span>}
            {ad.subTitle && (
              <span className="text-[11px] font-black text-white leading-snug whitespace-pre-line">
                {ad.subTitle}
              </span>
            )}
          </div>

          {/* Dots Indicator */}
          {ad.images.length > 1 && (
            <div className="absolute top-3 right-3 flex space-x-1.5 z-30 bg-black/40 px-2.5 py-1.5 rounded-full backdrop-blur-sm">
              {ad.images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1 h-1 rounded-full transition-all duration-300 ${
                    idx === currentImgIndex ? "bg-white scale-125" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;
            e.preventDefault();
            window.open(ad.link, '_blank', 'width=1200,height=800,noopener,noreferrer');
          }}
          className={`flex items-center justify-center w-full py-3 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all duration-200 cursor-pointer text-center ${theme.btn}`}
        >
          자세히 보기
        </a>
      </div>
    </aside>
  );
}

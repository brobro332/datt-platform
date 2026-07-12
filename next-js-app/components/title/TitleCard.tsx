import { Button } from "@/components/common/Button";
import type { MemberTitleResponse } from "@/types/title";
import { Crown } from "lucide-react";

type TitleCardProps = {
  title: MemberTitleResponse;
  isPending?: boolean;
  onSelect?: (titleId: number) => void;
};

export function TitleCard({
  title,
  isPending = false,
  onSelect,
}: TitleCardProps) {
  return (
    <article
      className={[
        "rounded-3xl border p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-350 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between h-[230px] overflow-hidden",
        title.selected
          ? "border-amber-400 bg-amber-50/10 glow-warning"
          : "border-slate-200 bg-white/70",
      ].join(" ")}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border ${
              title.selected
                ? "bg-amber-50 text-amber-600 border-amber-100/50"
                : "bg-slate-50 text-slate-400 border-slate-105"
            }`}>
              <Crown className={`w-5 h-5 ${title.selected ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {title.code}
              </p>
              <h3 className="mt-0.5 text-base font-extrabold text-slate-900 leading-tight">
                {title.name}
              </h3>
            </div>
          </div>

          {title.selected && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black text-amber-700 border border-amber-200/20 uppercase tracking-wide">
              대표
            </span>
          )}
        </div>

        <p className="text-xs font-semibold leading-relaxed text-slate-500">
          {title.description}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100/80 pt-4 text-xs font-bold">
        <p className="text-[10px] text-slate-400">
          획득일: {new Date(title.acquiredAt).toLocaleDateString()}
        </p>

        <Button
          type="button"
          variant={title.selected ? "secondary" : "primary"}
          disabled={title.selected || isPending}
          onClick={() => onSelect?.(title.titleId)}
          className="h-8 px-4 text-[10px] font-black rounded-xl"
        >
          {title.selected
            ? "장착 완료"
            : isPending
              ? "변경 중..."
              : "칭호 장착"}
        </Button>
      </div>
    </article>
  );
}
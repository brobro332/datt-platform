const filters = [
  "전체",
  "맛집",
  "카페",
  "술집",
  "숙소",
  "놀거리",
];

type PlaceFilterChipsProps = {
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  className?: string;
};

export function PlaceFilterChips({
  selectedFilter,
  onSelectFilter,
  className = "max-w-xl",
}: PlaceFilterChipsProps) {
  return (
    <div className={`flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200/50 bg-slate-100/60 p-1 shadow-inner ${className}`}>
      {filters.map((filter) => {
        const isSelected = selectedFilter === filter;
        return (
          <button
            key={filter}
            type="button"
            onClick={() => onSelectFilter(filter)}
            className={`flex-1 h-full rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer active:scale-95 ${
              isSelected
                ? "bg-white text-indigo-655 shadow-md shadow-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
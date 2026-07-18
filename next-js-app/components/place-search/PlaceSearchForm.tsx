"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

type PlaceSearchFormProps = {
  onSearch?: (keyword: string) => void;
};

export function PlaceSearchForm({
  onSearch,
}: PlaceSearchFormProps) {
  const [keyword, setKeyword] = useState("");

  function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();

    onSearch?.(keyword);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-slate-200/60 bg-white/90 p-2 shadow-sm md:flex-row md:items-center"
    >
      <div className="flex-1 relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">🔍</span>
        <input
          id="keyword"
          type="text"
          placeholder="장소명, 지역명을 입력하세요"
          className="h-12 w-full rounded-xl bg-transparent pl-11 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition focus:bg-white/40"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>

      <Button type="submit" className="h-12 md:w-28 shadow-lg shadow-indigo-600/10">
        탐색
      </Button>
    </form>
  );
}
export type PlaceCategory = "FOOD" | "CAFE" | "BAR" | "STAY" | "PLAY" | "OTHER";

export function getCategoryFromText(mclsNm: string | null | undefined, sclsNm: string | null | undefined): PlaceCategory {
  const text = ((mclsNm ?? "") + " " + (sclsNm ?? "")).toLowerCase();
  if (text.includes("food") || text.includes("한식") || text.includes("중식") || text.includes("일식") || text.includes("양식") || text.includes("음식점") || text.includes("맛집") || text.includes("식당") || text.includes("분식")) return "FOOD";
  if (text.includes("cafe") || text.includes("카페") || text.includes("커피") || text.includes("제과") || text.includes("디저트")) return "CAFE";
  if (text.includes("bar") || text.includes("술집") || text.includes("호프") || text.includes("주점") || text.includes("이자카야") || text.includes("맥주") || text.includes("포장마차") || text.includes("선술집") || text.includes("포차") || text.includes("칵테일") || text.includes("와인바") || text.includes("위스키")) return "BAR";
  if (text.includes("stay") || text.includes("숙소") || text.includes("호텔") || text.includes("모텔") || text.includes("펜션") || text.includes("게스트") || text.includes("숙박")) return "STAY";
  if (text.includes("play") || text.includes("놀거리") || text.includes("엔터") || text.includes("노래방") || text.includes("pc") || text.includes("게임") || text.includes("공연") || text.includes("영화") || text.includes("놀이")) return "PLAY";
  return "OTHER";
}

export function getPlaceholderDetails(category: PlaceCategory) {
  switch (category) {
    case "FOOD":
      return {
        gradient: "from-[#eaeef2] to-[#d9e2ec]",
        icon: "🍜",
        label: "맛집 · 식음료",
        colorText: "text-slate-600",
      };
    case "CAFE":
      return {
        gradient: "from-[#ecebe9] to-[#d7d4cf]",
        icon: "☕",
        label: "카페 · 디저트",
        colorText: "text-slate-600",
      };
    case "BAR":
      return {
        gradient: "from-[#e2e4e8] to-[#ced4da]",
        icon: "🍺",
        label: "술집 · 호프 · 바",
        colorText: "text-slate-600",
      };
    case "STAY":
      return {
        gradient: "from-[#edf0f2] to-[#d6e0e6]",
        icon: "🏨",
        label: "숙박 · 숙소",
        colorText: "text-slate-600",
      };
    case "PLAY":
      return {
        gradient: "from-[#e5e9ec] to-[#d0dbe2]",
        icon: "🎡",
        label: "놀거리 · 여가",
        colorText: "text-slate-600",
      };
    default:
      return {
        gradient: "from-[#f1f3f5] to-[#e9ecef]",
        icon: "✨",
        label: "기타",
        colorText: "text-slate-500",
      };
  }
}

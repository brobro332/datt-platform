import adsDataJson from "./adsData.json";

export interface AdItem {
  id: string;
  title: string;       // 광고 제목 (줄바꿈 \n 사용 가능)
  description: string; // 광고 본문 설명
  badge?: string;      // 광고 영역 상단 태그 (예: SPONSORED, HOT)
  subTitle?: string;   // 이미지 카드 내부의 강조 문구
  emoji?: string;      // 강조용 이모지
  link: string;        // 클릭 시 이동할 링크 URL
  images: string[];    // 상품별 이미지 경로 (로컬 public 폴더 기준 경로)
  themeColor?: string; // 테마 포인트 컬러 (indigo, blue, teal, rose 등)
}

export const adsData: AdItem[] = adsDataJson as AdItem[];

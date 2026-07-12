export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  kakaoMapAppKey: process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY ?? "",
  kakaoClientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID ?? "",
  kakaoRedirectUri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ?? "",
  naverClientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID ?? "",
  naverRedirectUri: process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI ?? "",
}
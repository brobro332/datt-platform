
## f32b0f3
- 작업 목적: 크루 정식 초대 시스템 구축 및 모바일 탐색 버튼 픽스
- 구체적 내용:
  - 백엔드: WorkspaceInvitation 엔티티 신설 및 관련 초대 수락/거절 API 구현
  - 백엔드: 유저 닉네임 검색 API(MemberProfileController) 구현
  - 프론트엔드: 크루 레이아웃(layout.tsx) 초대 모달 고도화 (유저 검색, 보낸 내역, 코드 공유 탭 분리)
  - 프론트엔드: 크루 허브(page.tsx)에 받은 초대장 UI 연동
  - 프론트엔드: 모바일 환경 대응 GlobalHeader.tsx touchstart 이벤트 추가

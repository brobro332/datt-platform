# ⚓ DATT 플랫폼 히스토리 백과 (v2.0.2 개발자 노트)

## 🚀 DATT v2.0.2 상세 타임라인 개발 역사

`main` 브랜치에 누적된 v2.0.2 개발 역사는 **실시간 채팅 서비스 연동 및 배포 파이프라인 구축**을 통해 사용자 간의 실시간 소통 기능을 플랫폼에 확보하는 마일스톤을 다룹니다.

### 📅 2026-07-22: 실시간 채팅방 개설 및 웹소켓(STOMP) 연동 UI 개발, Nginx 리버스 프록시 및 docker-compose 통합 배포 환경 구축
* `64eef6b` - **실시간 채팅 통합 인프라 구성 및 Nginx 프록시 라우팅 추가**
    * **작업 내용**: 
        * `datt-platform`의 `docker-compose.yml`에 실시간 메시징을 위한 `wave-redis`, `wave-kafka` 및 `wave-messaging-service` 컨테이너 선언 추가.
        * Nginx 설정(`default.conf`)에 `/api/chat/*` 및 WebSocket 프로토콜 업그레이드를 지원하는 `/ws-stomp/*` 리버스 프록시 포워딩 경로 추가.
* `64eef6b` - **Next.js 프론트엔드 실시간 채팅 UI 및 STOMP 웹소켓 연동 개발**
    * **작업 내용**:
        * `@stomp/stompjs` 패키지를 도입하고, STOMP 프로토콜을 사용해 실시간 메시지 발신 및 수신(구독)을 통합 관리하는 커스텀 훅 `useChat.ts` 구현.
        * `chatService.ts`를 신설하여 채팅방 생성, 참가, 읽음 처리, 목록 조회, 과거 메시지 복원 REST API 연동 기능 탑재.
        * 다크 글래스모피즘 테마의 반응형 채팅방 목록 페이지(`/chat`) 및 실시간 채팅방 상세 페이지(`/chat/[roomId]`) UI 화면 완비.

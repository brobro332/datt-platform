
### 43e056a 전사적 로그 보안 점검 및 마스킹 처리
- **작업 파일**: KakaoClient.java, EmailService.java
- **작업 목적**: 서비스 운영 중 민감한 인증 코드 등이 로그에 노출되는 것을 방지 및 모니터링 품질 향상
- **작업 내용**:
  - KakaoClient.java: 카카오 로그인 OAuth 코드 값 마스킹(***) 및 오탐 방지를 위해 log.error를 log.info로 레벨 조정
  - EmailService.java: 이메일 인증 실패 시 콘솔에 출력되던 이메일 인증 코드(code)를 마스킹(***) 처리하여 개인정보 및 인증 우회 보안 취약점 차단


### 7a433d3 Spring Security Actuator 엔드포인트 권한 해제
- **작업 파일**: spring-boot-app/src/main/java/xyz/datt/global/config/SecurityConfig.java
- **작업 목적**: Prometheus가 datt-platform의 메트릭 데이터를 수집하지 못하는 문제 해결
- **작업 내용**:
  - Spring Security 설정(SecurityConfig.java)의 permitAll() 목록에 /actuator/** 경로가 누락되어 있어 Prometheus의 접근이 차단(401/403)되고 있던 버그 수정

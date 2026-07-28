# ⚓ DATT 플랫폼 히스토리 백과 (v2.0.2 개발자 노트)

## 🚀 DATT v2.0.2 상세 타임라인 개발 역사

`main` 브랜치에 누적된 v2.0.2 개발 역사는 **워크스페이스 개념 도입 및 친구 초대 기반 실시간 채팅 시스템 구축**을 통해 사용자 간의 그룹 협업 및 실시간 소통 기능을 플랫폼에 확보하는 마일스톤을 다듭니다.

### 📅 2026-07-22: 워크스페이스(Workspace) 개설, 초대 코드 기반 참가 및 Slack 스타일 다중 사이드바 대시보드 UI 개발
* `1c190b6` - **실시간 채팅 및 워크스페이스 통합 인프라 구성 및 Nginx 프록시 라우팅 추가**
  * **작업 내용**:
    * `datt-platform`의 `docker-compose.yml`에 실시간 메시징을 위한 `wave-redis`, `wave-kafka` 및 `wave-messaging-service`(Arm64 OCI VM용 호환 이미지 `eclipse-temurin:17-jre`로 구성) 컨테이너 선언 추가.
    * Nginx 설정(`default.conf`)에 `/api/chat/*` 및 WebSocket 프로토콜 업그레이드를 지원하는 `/ws-stomp` 라우팅 설정 추가.
  * **결과**: `datt-platform`의 Next.js 프론트엔드가 Nginx 리버스 프록시를 통해 80번 포트로 통신하며, 백엔드 메시징 서비스와 9092, 6380 포트 분리 환경 위에서 실시간 STOMP 통신을 수행할 수 있는 완벽한 연동 인프라 완성.

### 📅 2026-07-28: 워크스페이스 도메인(DATT)과 채팅 도메인(WAVE) 완벽 분리 및 캘린더 UI 독립

* `d88b04f` - **워크스페이스 API CORS 및 엔드포인트 경로 버그 픽스**
    * **작업 내용**: 
        * `WorkspaceController`에 남아있던 `@CrossOrigin(origins = "*")` 어노테이션이 전역 Security Config의 `allowCredentials=true` 옵션과 충돌하여 발생하는 `500 Internal Server Error` (IllegalArgumentException) 문제를 해결하기 위해 해당 어노테이션을 제거했습니다.
        * `WorkspaceAppointmentController`의 매핑 주소가 과거 잔재인 `/api/wave/workspaces/...`로 남아있어 프론트엔드 연동 시 404 에러가 발생하는 문제를 `/api/workspaces/...`로 올바르게 수정했습니다.

* `3c880f0` - **워크스페이스 테이블 네이밍 규칙 DATT 표준화**
    * **작업 내용**: 엔티티 파일(`Workspace.java`, `WorkspaceMember.java`, `WorkspaceAppointment.java`)의 `@Table` 어노테이션에서 기존 `wave_` 접두사를 제거하고 DATT 테이블 네이밍 규칙(단수 명사)에 맞게 `workspace`, `workspace_member`, `workspace_appointment`로 테이블 명을 수정했습니다.
    * **결과**: 데이터베이스 테이블명이 DATT 플랫폼의 컨벤션과 일치하게 되어 도메인 관리의 일관성이 향상되었습니다.

* `847cff6` - **Nginx /api/workspaces 트레일링 슬래시 리라이트 룰 복구**
    * **작업 내용**: 이전 Nginx 리팩토링 과정에서 `/api/chat`과 `/api/workspaces`를 분리할 때 누락되었던 `/api/workspaces/` 트레일링 슬래시 제거 `rewrite` 규칙을 `location = /api/workspaces/` 블록으로 복구했습니다.
    * **결과**: 브라우저에 301 캐시된 트레일링 슬래시가 붙은 `/api/workspaces/` 요청이 Spring Boot 애플리케이션으로 포워딩되면서 발생하던 `NoHandlerFoundException` 및 500 에러를 완전히 해결하여 워크스페이스 조회 및 생성 기능이 다시 정상 동작합니다.

* `5c2c025` - **refactor: 워크스페이스와 채팅 마이크로서비스 도메인 완전 분리 및 캘린더 UI 분리**
  * **작업 내용**:
    * `wave-messaging-service`에 있던 워크스페이스 개설/멤버/달력(Appointment) 관련 코드를 `datt-platform`(`spring-boot-app`)으로 이동 (동일 `datt-db` 사용 중이므로 JPA 연관관계 손상 없음).
    * `wave-messaging-service`는 순수 실시간 채팅(ChatRoom) 로직만 남기고, 관련된 Nginx 라우팅에서 `workspaces`를 제거하여 `/api/workspaces`는 DATT로 향하도록 수정.
    * 프론트엔드(`next-js-app`)의 채팅 페이지(`page.tsx`) 내부에 있던 캘린더 슬라이드오버를 제거하고, 독립된 경로(`/workspaces/[workspaceId]/calendar`)를 생성하여 라우팅 연결.
  * **결과**: 워크스페이스 도메인(DATT)과 순수 메시징(WAVE) 역할이 명확해지고, 캘린더 기능이 독립된 페이지로 분리되어 구조적 완결성을 갖춤.

        * Nginx 설정(`default.conf`)에 `/api/chat/*` 및 WebSocket 프로토콜 업그레이드를 지원하는 `/ws-stomp` 리버스 프록시 포워딩 경로 추가. (301 리다이렉션으로 인한 웹소켓 핸드셰이크 실패 오류를 막기 위해 `/ws-stomp` 트레일링 슬래시도 함께 제거)
        * **[추가 수정]** Nginx `/api/workspaces` 블록에 리라이트(`rewrite`) 규칙을 내장하여, 브라우저가 캐싱한 이전 301 트레일링 슬래시(`/`) 요청을 백엔드 진입 전 제거함으로써 404 매칭 실패 문제 완전 해결.
* `1c190b6` - **Next.js 프론트엔드 워크스페이스 대시보드 UI 개발 및 DATT 디자인 시스템 테마 통합**
    * **작업 내용**:
        * `@stomp/stompjs` 패키지를 도입하고, STOMP 프로토콜을 사용해 실시간 메시지 발신 및 수신(구독)을 통합 관리하는 커스텀 훅 `useChat.ts` 구현.
        * `chatService.ts`를 신설 및 업데이트하여 워크스페이스 개설, 조회, 초대코드 가입, 채팅방 생성, 참가, 읽음 처리, 목록 조회, 과거 메시지 복원 REST API 연동 기능 탑재.
        * **[디자인 통합]** DATT 고유 디자인 시스템(`MainLayout`) 및 밝은 연청색/화이트 테마 기반으로 전체 워크스페이스 대시보드 UI를 대대적으로 리팩토링하여 타 메뉴(장소탐색 등)와 일관성 부여.
        * **[GNB 연동]** 공통 헤더(`GlobalHeader.tsx`)에 '워크스페이스' 메뉴 항목을 공식 추가하여 진입 장벽 완화.
        * **[채팅 튜닝]** 톡방 입장/퇴장 시마다 클라이언트가 자동으로 `ENTER/LEAVE` 메시지를 데이터베이스에 강제 발행하여 피드를 오염시키던 문제 해결을 위해 자동 입장/퇴장 알림 발신부 영구 제거.
        * **[단일 채팅방 전환]** 워크스페이스당 단 1개의 고유 채팅방만 개설 및 매핑되도록 축소하고, 진입과 동시에 채팅창이 곧바로 활성화되도록 로직 일원화.
        * **[닉네임 표기 수정]** 멤버 가입 시 닉네임이 아닌 회원 고유 번호(숫자 2)가 노출되던 바인딩 버그를 `member.nickname` 전송 방식으로 교체하여 해결.
        * **[모바일 반응형 튜닝]** 모바일 해상도에서 화면 폭이 찌그러지던 문제를 해결하기 위해 좌측 사이드바를 숨기고 메뉴 클릭 시 흘러나오는 슬라이드 Drawer UI 구조 연동.
        * **[인덱스 파일 보완]** `docs/DEVELOPMENT_NOTE.md` 메인 인덱스 문서에 v2.0.2 버전 릴리즈 바로가기 링크 갱신 등록.
        * **[ES/Kafka 매장 검색 연동]** JPA Entity Lifecycle Listener를 이용하여 매장 정보 CUD 시 Kafka `place-events` 토픽으로 변경 이벤트를 비동기 발행하고, 이를 Consumer가 수신하여 Elasticsearch `places` 인덱스에 색인(Sync)하는 파이프라인 구축.
        * **[ES/Kafka 채팅 검색 연동]** Redis Subscriber DB 저장 직후 Kafka `chat-messages` 토픽을 발행하여 Elasticsearch `chat_messages` 인덱스에 색인하는 Consumer 연동. 대화방 우측 상단 돋보기 아이콘을 배치해 실시간 키워드 검색 모달 뷰어 UI 탑재.
        * **[메모리 리밋 강제 튜닝]** 4OCPU, 램 24GB OCI 실서버에 맞추어 모든 도커 컨테이너(DB, ES, Kafka, Redis, 백엔드 2개, 프론트엔드, Nginx)에 최대 Resource Limits (`memory`)를 지정하고, Java/Node 컨테이너 힙 튜닝(JAVA_OPTS/NODE_OPTIONS)을 완료하여 OOM 강제 킬(kill) 안전장치 확보.
        * **[ES 헬스체크 및 역직렬화 안정화]** ES 초기 기동 지연(Nori 플러그인 기동 다운로드 등)으로 인한 스프링 기동 실패 오류를 차단하기 위해 `docker-compose.yml` 에 ES Healthcheck 지정 후 depends_on 대기를 걸었으며, Kafka 수신 시 ClassCastException 역직렬화 오류를 막기 위해 파라미터 타입을 `String`으로 수신하여 ObjectMapper로 명시적 매핑하도록 개편.
        * **[ES indices.exists 클라이언트 버그 회피]** Elasticsearch Java Client의 HEAD indices.exists 버그로 인해 기동 시 발생하던 `TransportException: Expecting a response body, but none was sent` 400 Bad Request 에러를 해결하기 위해, `@Document(createIndex = false)` 설정을 추가 적용하여 애플리케이션 시작 시점의 존재 여부 검증 단계를 안전하게 건너뛰도록 연동 완료.
        * **[ObjectMapper 빈 주입 및 Kafka 브로커 부팅 대기 체인 완료]** 백엔드(`spring-boot-app`) 기동 시 `ObjectMapper` 빈이 자동 주입되지 않아 구동에 실패하는 에러를 `PlaceKafkaConsumer` 내부에서 직접 수동 생성하여 주입을 제거함으로써 해결. 또한 Kafka 브로커(`wave-kafka`)의 부팅 지연으로 인해 백엔드가 구동 중 리스너 생성에 실패하는 문제를 막고자 `docker-compose.yml` 에 Kafka `healthcheck`를 주입하고 백엔드 2개의 `depends_on` 에 `wave-kafka`의 헬시 상태 대기를 강제 부여하여 견고한 부팅 체인 완비.
        * **[ARM64 아키텍처 호환성 Kafka 이미지 교체]** 실서버 OCI VM의 ARM64(Aarch64) 아키텍처 환경에서 x86용 `bashj79/kafka-kraft` 이미지가 ELF 실행 불가로 `exec format error` 오류를 야기하던 문제를 해결하기 위해, ARM64를 공식 지원하고 멀티 아키텍처 대응이 검증된 `apache/kafka:latest` 이미지로 전격 교체 및 KRaft 환경변수(Node ID, Quorum Voters 등) 세부 튜닝 적용.
        * **[KafkaAutoConfiguration 활성화를 위한 의존성 튜닝]** `spring-boot-app` 의 `build.gradle`에 단순 `spring-kafka` 가 임포트되어 있어 스프링 부트의 카프카 자동구성(`KafkaAutoConfiguration`)이 스킵되고 `KafkaTemplate` 빈이 누락되던 버그를, 정식 스타터 패키지인 `spring-boot-starter-kafka` 로 전격 업그레이드 교체하여 해결.
        * **[Nori 형태소 분석기 맵핑 강제 주입 초기화 구현]** `createIndex = false` 설정으로 인해 인덱스가 동적 자동 개설될 때 `nori` 분석기 맵핑이 적용되지 않고 `standard` 맵핑으로 우회되던 문제를 해결하고자, 백엔드 기동 완료 시점에 `ElasticsearchOperations`를 사용해 Nori 맵핑 정보를 명시적으로 꽂아주는 `ElasticsearchIndexInitializer` 초기화 컴포넌트 추가 및 튜닝 적용.
        * **[MatchQuery 전환을 통한 Nori 형태소 매칭 실현]** 스프링 데이터 Elasticsearch의 쿼리 선언 중 `contains` 메소드가 WildcardQuery(`*keyword*`)를 강제 생성하여 Nori 한글 형태소 분석 처리를 생략하고 단순 문자열 패턴 매칭을 유도해 형태소 검색이 무용지물화되던 오동작을 수정하고자, `is` 메소드를 통해 MatchQuery를 정상 유도함으로써 입력 검색어 및 DB 데이터 모두 Nori 분석을 거쳐 "순댓국"에서 "순대"가 완벽 매칭되도록 교정 완료.
        * **[Ngram 하이브리드 멀티필드 한글 부분 검색 완성]** 복합 단어 형태소 경계와 관계없이 한글 부분 일치 검색율을 보장하고자, 2~3글자씩 분해하는 `ngram_analyzer`를 settings.json에 정의하고 엔티티 필드에 `.ngram` 멀티필드로 연동하여, 검색 쿼리에서 Nori 형태소와 Ngram 부분 일치를 모두 탐색하는 하이브리드 검색 쿼리 완성. 기동 시 기존 인덱스 강제 갱신(drop) 후 PostgreSQL DB의 모든 장소 마스터 데이터를 ES로 무손실 동기화(Migration) 마친 뒤 런타임에 진입하도록 초기화 구현 완비.
        * **[장소 탐색 API의 Elasticsearch 검색 라우팅 누락 복구]** `/api/place-masters` (장소 탐색) 메뉴 검색 시 비즈니스 레이어(`PlaceMasterService.java`)에서 고성능 Elasticsearch 전용 검색 빈인 `PlaceSearchService`를 주입받아 사용하지 않고, 기존의 RDBMS Repository 검색으로 우회하여 호출하던 연동 누락을 찾아내어 교정. 이제 장소 탐색 검색에서도 키워드가 주어졌을 때 Elasticsearch 인덱스를 완벽하게 라우팅하여 Ngram/Nori의 혜택을 온전히 누리도록 정밀 연계 완료.
        * **[개발자 노트 UI 버전 드롭다운 v2.0.2 추가 및 API 동적 라우팅]** Next.js의 개발자 노트 모달(`DevNoteModal.tsx`)에 `v2.0.2` 선택 버튼 및 Latest 표식을 추가하고, `/next-api/dev-note/route.ts` API 분기문을 하드코딩이 아닌 동적 파일 리딩 방식으로 교체하여 신규 개발자 노트가 UI상에 무중단으로 정상 렌더링되도록 구현.
        * **[JPA 페이징 기법을 통한 Elasticsearch OOM 방지 마이그레이션]** 백엔드 기동 완료 시점에 대량의 매장 데이터를 메모리에 한 번에 올리다(`findAll()`) 마이그레이션이 실패하며 `places` 인덱스 자체가 개설되지 못하던 오류를 교정하고자, 1,000건 단위 분할 마이그레이션(PageRequest.of(i, 1000))을 도입해 메모리 안전성 및 무손실 동기화 기동 체계를 완성.
        * **[Elasticsearch 자바 설정 커스텀 헤더 바인딩을 통한 Accept Header 충돌 해결]** 최신 Java Client 9.2.5 라이브러리와 Elasticsearch 8.x 서버 간의 Accept Header compatible-with=9 미디어 타입 미인식 충돌로 인한 `media_type_header_exception` 에러를 완벽히 소멸시키고자, `MyElasticsearchConfig.java` 클래스를 두 백엔드에 각각 신설하여 호환성 헤더 전송을 비활성화하고 `application/json` 고정 헤더를 주입해 통신 정합성을 원천 해결함.













### [복구된 추가 작업 내역]

* `15c8e3a` - **Swagger UI 연동, Controller Javadoc 추가 및 User Guide 모달 테두리 제거**
    * **작업 내용**:
        * `spring-boot-app`의 `build.gradle`에 `springdoc-openapi-starter-webmvc-ui` 의존성 추가 및 `application.yml`에 Swagger 경로 설정.
        * 추후 API 분석기를 위한 21개 Controller 클래스 비즈니스 로직(Call Graph) 상세 Javadoc 작성 완료.
        * Next.js 프론트엔드 `UserGuideModal.tsx`의 각 기능 블록 테두리(border) 제거하여 UI 개선.

* `(git rev-parse --short HEAD)` - **Swagger(springdoc) TypeInformation 런타임 에러 핫픽스**
    * **작업 내용**: Spring Boot 최신 버전에서 삭제된 TypeInformation 클래스를 springdoc이 QueryDSL 통합 과정에서 참조하여 앱 기동이 실패하는 문제 해결을 위해, 임시 더미 인터페이스를 추가하여 클래스 로딩 에러(NoClassDefFoundError)를 우회함.

### 2a116ae TraceId 전파 및 IP 로깅 추가
- **작업 파일**: nginx/default.conf, spring-boot-app/src/main/java/xyz/datt/global/logging/RequestLoggingFilter.java
- **작업 목적**: 분산 환경 로깅(Trace ID 전파) 및 클라이언트 IP 수집 기능 추가
- **작업 내용**:
  - Nginx가 생성한 $request_id를 X-Trace-Id 헤더로 전달하도록 설정
  - RequestLoggingFilter에서 X-Trace-Id 헤더 우선 적용 및 X-Forwarded-For 헤더를 통한 IP 수집 로직 추가

### 3adbc44 모니터링 메트릭 추가 및 로그 제한 설정
- **작업 파일**: spring-boot-app/build.gradle, spring-boot-app/src/main/resources/application.yml, docker-compose.yml
- **작업 목적**: Prometheus 메트릭 수집 허용 및 Docker 로그 무한 증식 방지
- **작업 내용**:
  - `spring-boot-starter-actuator`, `micrometer-registry-prometheus` 의존성 추가
  - `application.yml`에 Actuator 엔드포인트 개방 설정 추가
  - `docker-compose.yml`에서 `spring-boot-app`과 `wave-messaging-service`의 로그 사이즈 제한(10m, 3개) 설정

### 71fb191 어드민 포털 사이드바 시스템 링크(Grafana, Swagger) 추가
* **작업 파일**: next-js-app/app/admin/layout.tsx
* **작업 목적**: 관리자 접근성을 높이기 위해 모니터링 및 API 명세서 외부 링크 연동
* **작업 내용**:
  * Next.js 환경변수(NEXT_PUBLIC_GRAFANA_URL, NEXT_PUBLIC_DATT_SWAGGER_URL, NEXT_PUBLIC_WAVE_SWAGGER_URL)를 참조하여 동적으로 URL을 주입.
  * 어드민 사이드바 영역에 'System Links' 그룹을 신설하고 Lucide 아이콘(Activity, BookOpen, MessageSquareCode)과 함께 링크 UI 추가.

### 55736fa Nginx 프록시를 활용한 안전한 Swagger 연동 (HTTPS 지원)
* **작업 대상**: 
  * `nginx/default.conf`
  * `spring-boot-app/src/main/resources/application.yml`
  * `next-js-app/app/admin/layout.tsx`
* **작업 목적**: 외부 포트(8080, 8081) 노출 없이 안전하게 HTTPS 443 포트만으로 Swagger UI 접근 환경 구성
* **작업 내용**:
  * Nginx에 `/datt-swagger/` 및 `/wave-swagger/` Location 블록 추가 및 `X-Forwarded-Prefix` 헤더 주입
  * Spring Boot(`datt-platform`, `wave-messaging-service`) 설정에 `server.forward-headers-strategy: framework` 추가하여 역방향 프록시 주소 지원
  * 어드민 페이지 "System Links"의 기본 주소를 Nginx 프록시 HTTPS 주소로 수정

### 2a4a3af Next.js Docker 환경변수(ARG/ENV) 빌드 주입 누락 수정
* **작업 대상**: 
  * `docker-compose.yml`
  * `next-js-app/Dockerfile`
* **작업 목적**: 깃허브 시크릿으로 주입한 `NEXT_PUBLIC_` 환경변수가 Next.js 컨테이너 빌드 시점에 정상적으로 주입되도록 파이프라인 수정
* **작업 내용**:
  * `docker-compose.yml`의 `args` 및 `environment`에 Grafana 및 Swagger URL 환경변수 추가
  * `next-js-app/Dockerfile`에 해당 변수들을 `ARG` 및 `ENV`로 선언하여 정적 빌드 시점에 값을 읽을 수 있도록 수정

### bf18b29 GitHub Actions CD 파이프라인 누락 시크릿 추가
* **작업 대상**: .github/workflows/deploy.yml
* **작업 목적**: 깃허브 시크릿이 OCI VM의 .env에 올바르게 전달되도록 파이프라인 수정
* **작업 내용**:
  * `appleboy/ssh-action`의 `env` 및 `envs` 구문에 `NEXT_PUBLIC_GRAFANA_URL` 외 2개의 변수 추가
  * SSH 실행 스크립트에서 .env 파일에 3개의 변수 출력문 추가

### 99a37b4 📊 모니터링을 통한 프론트엔드 N+1 API 호출 장애 발견 및 해결
* **작업 대상**: `next-js-app/hooks/useLatestReviewImage.ts` (이전 수정 내역 반영)
* **작업 목적**: 불필요한 API 중복 호출(N+1 문제) 방지를 통한 네트워크 및 서버 부하 최적화
* **작업 내용**:
  * **[문제 발견]** 그라파나(Grafana) 대시보드 모니터링 중, 특정 장소 렌더링 시 `/api/places/{placeId}/reviews` API 트래픽이 비정상적으로 치솟는 현상(순간 13회 호출)을 포착했습니다.
  * **[원인 분석]** 어드민 대시보드 통계상 실제 등록된 리뷰는 **0건**이었습니다. 원인을 분석한 결과, 프론트엔드에서 리뷰 썸네일 이미지를 찾을 때까지 불필요하게 반복적으로 리뷰 API를 재호출하는 **프론트엔드 발 N+1 호출 문제**가 원인이었습니다. 
  * **[해결 완료]** 썸네일 캐싱 로직 및 호출 방어 코드를 수정하여 중복 호출을 차단했습니다. 모니터링 시스템(Prometheus + Grafana)이 없었다면 0건의 데이터에서 조용히 발생하는 네트워크 누수를 발견하기 어려웠을 것입니다.

![Grafana 트래픽 스파이크 발견](https://raw.githubusercontent.com/brobro332/datt-platform/main/docs/images/grafana-n1-spike.png)
![실제 리뷰는 0건인 통계 화면](https://raw.githubusercontent.com/brobro332/datt-platform/main/docs/images/stats-zero.png)


### 6eb422f 어드민 포털 회원 관리 기능 추가 및 시스템 링크 메뉴 개편
* **작업 파일**:
  * spring-boot-app/src/main/java/xyz/datt/domain/member/controller/MemberAdminController.java (및 Service, DTO)
  * spring-boot-app/src/main/java/xyz/datt/global/config/SecurityConfig.java
  * next-js-app/app/admin/layout.tsx
  * next-js-app/app/admin/members/page.tsx
  * next-js-app/app/admin/systems/page.tsx
* **작업 목적**: 관리자 접근성을 높이기 위해 회원 목록 조회 기능을 신설하고, 산재해 있던 외부 시스템 링크를 단일 메뉴로 통합.
* **작업 내용**:
  * **[Backend]** `GET /api/admin/members` 엔드포인트를 추가하여 페이징 기반 회원 목록 조회 기능 구현.
  * **[Backend]** `SecurityConfig`에 `/api/admin/members/**` 경로 접근 권한(ADMIN) 부여.
  * **[Frontend]** 사이드바에서 `System Links` 분리 영역을 제거하고, `회원 관리` 및 `시스템 설정`을 메인 메뉴로 통합.
  * **[Frontend]** 백엔드 API를 연동하여 가입자 현황을 보여주는 회원 관리 테이블 뷰 완성.
  * **[Frontend]** Grafana, Swagger 링크를 카드 형태로 관리하는 시스템 설정 페이지 신설.

### e62fe5b 워크스페이스 약속 캘린더 기능 구현
* **작업 파일**:
  * (wave-messaging) src/main/java/xyz/messaging/wave/domain/WorkspaceAppointment.java 등 백엔드 API
  * (datt-platform) next-js-app/services/chatService.ts
  * (datt-platform) next-js-app/app/workspaces/[workspaceId]/page.tsx
* **작업 목적**: 워크스페이스 참여자들이 채팅방 안에서 오프라인 모임 약속을 정하고 캘린더 형태로 확인할 수 있는 기능 추가
* **작업 내용**:
  * **[Backend]** `wave-messaging-service`에 약속 엔티티 및 CRUD API 신설 (`/api/wave/workspaces/{id}/appointments`).
  * **[Frontend]** 대화방 우측 상단에 캘린더 아이콘 추가 및 클릭 시 우측에서 슬라이드 오픈되는 사이드바 패널 뷰 구현.
  * **[Frontend]** 새 약속 만들기 폼(제목, 날짜, 시간, 장소, 설명) 구현 및 백엔드 연동 완성.

### 446e4ca 타입스크립트 빌드 에러 및 인코딩 핫픽스
* **작업 파일**: 
  * next-js-app/app/workspaces/[workspaceId]/page.tsx
  * docs/DEVELOPMENT_NOTE_v2.0.2.md
* **작업 내용**: 
  * Next.js 프로덕션 빌드 단계에서 발생한 `Property 'id' does not exist on type` 타입 에러를 해결하기 위해, `member` 객체 참조 속성을 `member.id`에서 `member.memberId`로 수정.
  * 이전 커밋에서 발생한 개발자 노트 한글 깨짐 현상(인코딩 에러)을 복구하고, 커밋 메시지 정책(한글 작성)을 준수하도록 통합 핫픽스 적용.

### 1c6ac74 사이드바 '약속 캘린더' 준비중 배지 해제
* **작업 파일**: next-js-app/app/workspaces/[workspaceId]/layout.tsx
* **작업 내용**: 워크스페이스 좌측 네비게이션 패널의 '약속 캘린더' 영역에 걸려 있던 '준비중' 배지를 제거하고, 클릭 시 채팅방 내부 캘린더 기능을 이용하도록 유도하는 활성화 상태(채팅방 내장)로 UI를 업데이트했습니다.

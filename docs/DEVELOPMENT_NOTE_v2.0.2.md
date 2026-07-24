# ⚓ DATT 플랫폼 히스토리 백과 (v2.0.2 개발자 노트)

## 🚀 DATT v2.0.2 상세 타임라인 개발 역사

`main` 브랜치에 누적된 v2.0.2 개발 역사는 **워크스페이스 개념 도입 및 친구 초대 기반 실시간 채팅 시스템 구축**을 통해 사용자 간의 그룹 협업 및 실시간 소통 기능을 플랫폼에 확보하는 마일스톤을 다룹니다.

### 📅 2026-07-22: 워크스페이스(Workspace) 개설, 초대 코드 기반 참가 및 Slack 스타일 다중 사이드바 대시보드 UI 개발
* `caa45c7` - **실시간 채팅 및 워크스페이스 통합 인프라 구성 및 Nginx 프록시 라우팅 추가**
    * **작업 내용**: 
        * `datt-platform`의 `docker-compose.yml`에 실시간 메시징을 위한 `wave-redis`, `wave-kafka` 및 `wave-messaging-service`(Arm64 OCI VM용 호환 이미지 `eclipse-temurin:17-jre`로 구성) 컨테이너 선언 추가.
        * Nginx 설정(`default.conf`)에 `/api/chat/*` 및 WebSocket 프로토콜 업그레이드를 지원하는 `/ws-stomp` 리버스 프록시 포워딩 경로 추가. (301 리다이렉션으로 인한 웹소켓 핸드셰이크 실패 오류를 막기 위해 `/ws-stomp` 트레일링 슬래시도 함께 제거)
        * **[추가 수정]** Nginx `/api/workspaces` 블록에 리라이트(`rewrite`) 규칙을 내장하여, 브라우저가 캐싱한 이전 301 트레일링 슬래시(`/`) 요청을 백엔드 진입 전 제거함으로써 404 매칭 실패 문제 완전 해결.
* `caa45c7` - **Next.js 프론트엔드 워크스페이스 대시보드 UI 개발 및 DATT 디자인 시스템 테마 통합**
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
        * **[settings.json 분석기 설정 오류 교정]** CustomAnalyzer 하위에 잘못 정의되어 `JsonpMappingException (Unknown field 'decompound_mode')`을 유발하던 `decompound_mode` 설정을 `custom_nori_tokenizer` 토크나이저 정의 하위로 올바르게 재배치하여, 기동 시 places 인덱스가 정상 개설되지 못하던 기동 실패 문제를 완벽 교정함.

















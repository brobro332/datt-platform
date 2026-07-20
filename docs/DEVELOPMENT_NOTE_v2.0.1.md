# ⚓ DATT 플랫폼 히스토리 백과 (v2.0.1 개발자 노트)

## 🚀 DATT v2.0.1 상세 타임라인 개발 역사

`main` 브랜치에 누적된 v2.0.1 개발 역사는 **데이터 수집의 100% 자동화**, **자바 표준 기술을 사용한 엑셀 스트리밍 연동**, **프론트엔드 컴포넌트의 가상 DOM 튜닝 및 UX 최적화**를 통해 수동 조작을 완전히 배제하고 플랫폼 탐색 품질을 향상하는 마일스톤을 다룹니다.

### 📅 2026-07-18: 전국 지하철역 데이터 동기화 및 엑셀 실시간 파싱 자동화, 프론트엔드 드롭박스 UX 고도화
* `06ffa07` - **공공데이터 API 동기화 및 역사명 괄호 포맷 정규화 기능 추가**
    * **작업 내용**: RestClient 및 serviceKey를 통한 공공데이터포털 OpenAPI 기본 동기화 로직 및 역명 끝에 "역"을 붙여주는 기본 정규화 로직 구현.
* `91d69b1` - **공공데이터 API 에러 응답 XML/HTML 수신 시 예외 처리 개선 및 로그 정돈**
    * **작업 내용**: 공공데이터포털 API 호출 시 인증 에러로 인해 JSON 대신 XML 에러 응답(예: SERVICE_KEY_IS_NOT_REGISTERED_ERROR 등)이 반환될 때 발생하던 Jackson 파싱 예외를 사전에 방어하고, 에러 메시지를 추출하여 깔끔한 경고 로그 및 로컬 파일 Fallback 처리로 연동 안정성 개선.
* `6a440e1` - **국토부 철도산업정보센터(레일포털) 공식 엑셀 파일 실시간 다운로드 및 네이티브 파싱 연동 추가**
    * **작업 내용**: 유저의 수동 조작(다운로드/복사/변환)을 없애기 위해, 국토부 공식 데이터 제공처의 엑셀 다운로드 링크에서 직접 실시간으로 파일 다운로드받아 자바 내장 XML 스트리밍 API(StAX, ZipInputStream 및 XMLStreamReader)로 직접 파싱하여 DB에 동기화하는 백엔드 파이프라인 구축.
* `2b6633c` - **지하철 검색 드롭박스 지역 정보 노출, 검색 필터 로딩 시 깜빡임 버그 개선, 백엔드 중복 경고 제거 및 기존 지하철역 덮어쓰기 로직 연동**
    * **작업 내용**:
        * 지하철역 검색 시 가독성을 높이기 위해 드롭박스 옵션을 역명 (호선) - 지역(시도/시군구) 형식으로 표시하도록 수정.
        * 검색 필터 전환 시 이전 캐시 데이터가 노출되는 깜빡임 현상을 isFetching 상태와 바인딩하여 로딩 스피너가 즉시 뜨도록 개선.
        * 백엔드에서 data.go.kr API 호출부를 제거하고 국토부 엑셀 연동을 최우선으로 지정하여 에러 로그 제거.
        * 동기화 실행 시 기존 지하철역 정보를 일괄 삭제(deleteAllInBatch)하고 신규 데이터로 덮어쓰도록 구성하되, 중간 에러 발생 시 rollback되도록 트랜잭션 무결성 강화.
* `f2a2407` - **지하철역 드롭박스 검색 시 React 가상 DOM Key 중복으로 인한 목록 누적 버그 해결**
    * **작업 내용**: 드롭박스 내에서 검색 후 선택 시 React의 Key Reconciliation(가상 돔 재조정) 오류로 인해 필터링되었던 항목들이 지워하지 않고 누적되던 심각한 화면 오작동 버그 해결을 위해, 드롭박스 옵션의 key를 고유한 형태(key={`${opt}-${idx}`})로 지정하고 프론트엔드로 전달되는 배열을 Set으로 데두플리케이션 처리.
* `6630773` - **개발자 노트 버전별 분할 및 탭 인터페이스 구현**
    * **작업 내용**: 개발자 노트 문서를 v1.0.0, v2.0.0, v2.0.1로 나누고, 프론트엔드 모달에 버전 선택 탭을 추가하여 다이내믹하게 열람할 수 있도록 개선.
* `ba933a2` - **환승역 그룹화 단일 노출 및 드롭박스 라벨 가독성 개선**
    * **작업 내용**:
        * 동일한 역명과 지역을 가진 여러 개의 호선 레코드(예: 건대입구역 2호선 및 7호선)를 하나로 그룹화하여 드롭박스 목록에 단 한 번만 표시되도록 조치.
        * 드롭박스 검색 목록 및 선택창 버튼에서 실제 역 이름은 더 굵은 검은색 글씨로 표현하고, 호선명 및 지역 상세 정보는 작고 흐린 회색 글자(text-slate-450 text-xs)로 나누어 출력하여 시각적 인지 편의성 극대화.
* `a83db2a` - **닻 생성 시 추천 명소 제외 및 대체 교체 기능 추가**
    * **작업 내용**:
        * 사용자가 닻을 확정하기 전, 원치 않는 추천 매장을 제외하거나 해당 지역의 다른 매장으로 실시간 검색하여 교체할 수 있는 개인화 추천 편집 모듈 구현.
        * 프론트엔드(RecommendationSection.tsx, page.tsx)에서 "제외/복구" 및 "교체" 제어 버튼을 지원하고, 교체 시 상권 내 타 매장을 검색하는 모달을 탑재.
        * 백엔드(AnchorCreateRequest, AnchorPlaceCreateService, AnchorCreateService)에서 선택된 매장 ID 리스트(placeIds)를 전달받아, Haversine 공식 기반 거리 재연산 및 맞춤형 AnchorPlace 적재 배치 처리 수행.
* `9b2d8c3` - **이미 등록된 닻 수정 기능 추가 및 교체 검색 지역 강제 필터링**
    * **작업 내용**:
        * 이미 저장/생성 완료된 기존 닻도 작성자(소유주)에 한해 언제든 닻을 구성하는 매장(AnchorPlace)을 편집("제외/복구" 및 "교체")할 수 있는 기능 추가.
        * 백엔드에 PUT `/api/anchors/{anchorId}/places` 엔드포인트를 구현하여 기존 닻 소속 매장 정보를 삭제 후 신규 선택 리스트로 통째로 갱신하는 트랜잭션 구축.
        * 매장 교체 시, 해당 닻의 baseAddress 주소에서 시도명(province) 및 시군구명(district)을 파싱(parseRegionFromAddress)하여, 오직 해당 지역구 내에 위치한 매장들만 필터검색 및 교체 선택이 가능하도록 엄격히 락인(Lock-in) 적용.
* `75ffb89` - **장소 탐색 페이지네이션 개편 및 평점/리뷰/거리순 정렬 조건 커스텀**
    * **작업 내용**:
        * 장소 탐색 메뉴의 하단 페이징 인터페이스를 단순 "이전/다음" 버튼 구조에서 직관적인 "숫자 버튼 목록(최대 5개씩 슬라이딩 윈도우)" 형태로 전면 개편.
        * 장소 정렬 기준을 기존 4개(최신순, 이름순, 리뷰순, 평점순)에서 사용자 요구사항인 3개(평점순, 리뷰순, 거리순)로 간결하게 필터 재편.
        * 백엔드(PlaceSortType, PlaceSearchCondition, PlaceQueryRepositoryImpl)에 거리순(DISTANCE) 정렬 유형과 좌표 필드를 연동하고, 프론트엔드에서 거리순 선택 시 브라우저 Geolocation API를 통해 사용자의 현재 위도/경도를 실시간 획득하여 구면 삼각법(Haversine) 기반 거리순 정렬 쿼리 수행 및 카드에 거리 표시 구현.
* `a1eb5f6` - **장소 탐색 지역 검색 기능 추가, 플레이스홀더 수정 및 페이징 중복 버그 해결**
    * **작업 내용**:
        * 백엔드(`PlaceQueryRepositoryImpl`)에서 장소 검색 시 장소명 외에 시도/시군구/행정동/도로명주소도 함께 검색어로 비교하도록 like 검색(`containsIgnoreCase`) 기능 구현.
        * 평점/거리 등이 동일한 장소들의 정렬 순서가 보장되지 않아 페이징 이동 시 데이터 중복 노출이 발생하던 버그를 정렬 조건 끝에 `placeMaster.id.desc()`를 2차 정렬 조건으로 일괄 추가하여 해결.
        * 프론트엔드(`PlaceSearchForm.tsx`, `page.tsx`)의 검색창 플레이스홀더 및 안내 설명문에서 불필요한 '카테고리' 텍스트 제거.
* `60066c0` - **ADMIN 권한 관리자 페이지 개설 및 주소 좌표 변환(Geocoding)을 통한 장소 수동 등록 기능 추가**
    * **작업 내용**:
        * 백엔드에 카카오 로컬 API (`/v2/local/search/address.json`) 프록시 엔드포인트 `GET /api/admin/places/geocode` 및 `POST /api/admin/places` 신규 장소 저장 API 구축.
        * 보안 필터(`SecurityConfig.java`)에 `/api/admin/places/**`에 대한 `ADMIN` 역할(hasRole("ADMIN")) 인가 정책을 부여해 외부 접근 차단.
        * 로그인 및 소셜 로그인 응답 DTO에 `role` 정보를 추가하고, 프론트엔드 `authStore.ts` 전역 상태와 로컬 스토리지에 이를 전달 및 보존.
        * 프론트엔드 관리자 전용 대시보드 화면(`/admin`)을 구현하고, 비관리자 진입 시 즉시 홈 화면으로 차단/리다이렉트하는 인가 UX 처리.
        * 주소 입력 후 '좌표 변환'을 실행하면 지오코딩 결과로 매칭된 위도, 경도, 도로명주소 및 행정동/시도/시군구 구역 정보를 폼에 자동 맵핑하는 지능형 등록 폼 레이아웃 설계.
* `bd022f7` - **어드민 전용 레이아웃 분리(다크 테마, 사이드바 탑재) 및 광고 관리 기능 추가**
    * **작업 내용**:
        * 백엔드에 광고 관리 도메인(`xyz.datt.domain.advertisement`) 패키지를 신설하고 `Advertisement` 엔티티, JPA 리포지토리 및 광고 생성/삭제/조회 비즈니스 서비스 구현.
        * 보안 설정(`SecurityConfig.java`)에 `/api/admin/ads/**` 인가 조건(ROLE_ADMIN)을 추가하고 public 조회 엔드포인트 `/api/ads`는 permitAll 적용.
        * 프론트엔드 어드민 전용 레이아웃(`admin/layout.tsx`)을 설계하여 네이비/다크 메탈릭 테마의 사이드바/헤더를 사용자 화면과 완전 분리 적용하고 비관리자 강제 차단 구현.
        * 기존 장소 수동 등록 폼을 `/admin/places` 경로로 이관하고, `/admin` 루트 접속 시 `/admin/places`로 자동 리다이렉트 처리.
        * 신규 광고 관리 탭 `/admin/ads`를 추가하여 등록된 광고 목록 조회/삭제를 구현하고, 기존 파일 업로드 API(`/api/files/upload`)를 연계하여 실제 배너 파일 드롭존 업로드 지원.
* `84e4292` - **배치 동기화 시 수동 등록된 매장의 일괄 폐업(CLOSED) 처리 방지 수정**
    * **작업 내용**:
        * `PlaceMasterRepository.java`의 `updateClosedPlaces` JPQL 벌크 업데이트 쿼리를 수정하여, 마지막 동기화 시간 기준 폐업(CLOSED) 처리 시 `bizesId`가 `MANUAL-`로 시작하는 수동 등록 장소들은 제외하도록 보장(`and p.bizesId not like 'MANUAL-%'`).
* `78738b9` - **사용자 헤더에 관리자 페이지 바로가기 링크 추가 및 어드민 타이틀 시인성 개선**
    * **작업 내용**:
        * 사용자 페이지 헤더(`GlobalHeader.tsx`) 내에 로그인한 유저의 역할이 `ADMIN`일 경우 바로가기 "관리자 페이지" 링크 버튼 렌더링.
        * 어드민 레이아웃(`layout.tsx`)의 그라데이션 타이틀 끝색을 `to-indigo-350`에서 `to-slate-200`으로 변경하여 어두운 배경에서의 텍스트 시인성 확보.
* `14234c9` - **관리자 DB 조작 행위(매장 등록, 광고 등록/삭제)에 대한 실시간 DB 감사 로그 적재 구현**
    * **작업 내용**:
        * 관리자 활동 감사 로그 엔티티 `AdminActivityLog` 및 JPA 리포지토리, 저장용 비즈니스 서비스(`AdminActivityLogService`)를 `xyz.datt.domain.admin` 패키지에 신설.
        * `AdminActivityLogService` 내에 `HttpServletRequest`를 분석해 실제 클라이언트 IP 주소를 신뢰성 높게 추출(X-Forwarded-For 등 로직 포함)하는 유틸 탑재.
        * `PlaceAdminController.java` 및 `AdvertisementAdminController.java`에서 DB 조작 작업 발생 시, `@AuthenticationPrincipal`로 현재 관리자 ID를 판별하여 이메일, 닉네임, 작업 종류(CREATE_PLACE, CREATE_AD, DELETE_AD), 구체적인 행위 상세 설명 및 IP 주소를 `admin_activity_log` 테이블에 실시간 저장하도록 비즈니스 보강.
* `5db7969` - **작성한 리뷰 전체 페이징 조회 구현 및 리뷰/피드에 칭호(Title) 노출 추가**
    * **작업 내용**:
        * 백엔드 `PlaceReviewRepository`에 사용자 ID별 리뷰 페이징 조회 메소드(`findAllByMemberIdOrderByCreatedAtDesc`)를 신설하고, `PlaceReviewController`에 `GET /api/reviews/my` 마이리뷰 페이징 API 구현.
        * `PlaceReviewResponse` 및 `AnchorSummaryResponse`/`AnchorDetailResponse` DTO에 작성자 대표 칭호명(`memberTitleName`/`creatorTitleName`)과 작성자 닉네임을 추가하고, 각 서비스 레이어에서 `MemberTitleRepository`를 조회해 칭호 정보를 실어주도록 비즈니스 보강.
        * 프론트엔드 마이리뷰 페이지(`/my/reviews/page.tsx`)에서 기존 프로필에 딸려있던 최근 3개 리뷰 임시 노출 대신, 신규 마이리뷰 페이징 API를 활용해 전체 리뷰 리스트와 페이지네이션 컨트롤러를 적용.
        * 리뷰 카드 UI(`ReviewCard.tsx`) 및 피드 닻 카드 UI(`app/anchors/page.tsx`)에서 닉네임 옆에 작성자의 대표 장착 칭호를 뱃지 형식으로 선명하게 노출되도록 마크업 확장.
* `0d9124a` - **저장한 장소 보관함 폴더 공유 기능 추가**
    * **작업 내용**:
        * 사용자가 스크랩한 장소들을 폴더별로 외부 공유할 수 있는 공유 시스템 구축.
        * 백엔드(BookmarkFolderController, BookmarkFolderService, PlaceBookmarkRepository, PublicBookmarkFolderResponse)에 비로그인 사용자도 조회할 수 있는 폴더 및 북마크 조회 공개 API(GET `/api/bookmarks/folders/{folderId}/public`) 설계 및 Security Config 접근 권한 허용(permitAll) 적용.
        * 프론트엔드에 공유된 폴더의 북마크 리스트를 비로그인 상태로 볼 수 있는 공유 전용 페이지(`/bookmarks/[folderId]/page.tsx`)를 신설.
        * 내 보관함 페이지(`/my/bookmarks/page.tsx`)에서 특정 폴더 선택 시 작동하는 "공유" 액션 모달을 탑재하여 카카오톡 공유하기 및 공유용 링크 복사 기능 구현.
* `2ce396f` - **무효 토큰 프론트엔드 에러 핸들링 보강, 위치탐색 모바일 레이아웃 및 광고 높이 최적화**
    * **작업 내용**:
        * 프론트엔드 `apiClient.ts`의 Axios response interceptor를 개편하여 401/403 무효 토큰 발생 시 토큰 재발급(Reissue) 실패 대기 큐(`pendingRequests`)의 콜백을 `reject` 처리하도록 보완하여 API 무한 대기(pending) 현상을 차단.
        * Reissue 실패 시 `useAuthStore.getState().logout()`을 호출하여 Zustand 메모리 전역 상태와 LocalStorage 토큰을 완전히 동기화 초기화하고 로그인 페이지로 안전하게 유도.
        * 위치탐색 화면(`/map`)의 모바일 반응형 레이아웃을 수정하여(`h-auto lg:h-[calc(100vh-170px)]`, 사이드바/지도 높이 개별 부여) 모바일 화면에서 지도가 아래로 밀려 짤리는 현상 해결.
        * 광고 사이드바 컴포넌트(`AdBannerCard.tsx`, `MainLayout.tsx`)의 고정 높이를 `500px`에서 `540px`로 소폭 상향 조정.
* `ae23a28` - **모바일 위치탐색 UI/UX 원래 구조 원복 및 모바일 폰트 가독성/시인성 전면 상향 조정**
    * **작업 내용**:
        * 모바일 뷰 스위처(탭)를 사용자 요청에 따라 이전의 수직 레이아웃 구조로 완전 원복.
        * 모바일 화면에서 작은 글씨(`text-[9px]`, `text-[10px]`, `text-xs`)가 작아 읽기 어려웠던 텍스트들을 큼직하고 또렷한 폰트 스케일(`text-xs`, `text-sm`, `text-base` 등)로 인상하여 시인성 극대화.

## 🔍 핵심 챌린지 해결 사례 (Troubleshooting)

### 1) 공공데이터 API 에러 응답 XML/HTML로 인한 파싱 크래시 예외 처리
* **이슈**: API 키 등록 상태 문제 등으로 공공데이터 API가 JSON이 아닌 XML 에러 템플릿을 반환할 때, 자바 측 Jackson 파서가 JsonParseException(Unexpected character '<')을 내며 기동 중 전체 스택트레이스를 출력함.
* **원인**: 응답이 XML로 들어왔음에도 불구하고 강제로 ObjectMapper.readValue()를 호출했기 때문임.
* **해결책**: HTTP 응답 바디가 `<` 문자로 시작하는지 선제 검사하여 XML 에러임을 감지하고, 에러 메시지만을 추출해 단일 경고 로깅(log.warn) 후 곧바로 2차 로컬 파일 적재(Fallback)로 진입하도록 예외 제어 흐름 수정 완료.

### 2) React Virtual DOM Key Reconciliation(재조정) 혼선으로 인한 드롭박스 누적 현상
* **이슈**: 지하철역 검색용 CustomDropdown 내부에서 타이핑 검색 후 결과 중 하나를 선택하면, 이전 필터링 결과가 전체 목록 꼬리에 지워지지 않고 지저분하게 적재 및 누적되는 렌더링 오작동 발생.
* **원인**: dropdown list 아이템들의 렌더링 key로 일반 문자열을 그대로 사용하여 돔 요소 추적에 충돌이 일어났고, React가 삭제해야 할 DOM 요소를 감지하지 못해 화면에 누수 형태로 잔존시킴.
* **해결책**:
    * 컴포넌트 리스트 맵핑 시 각 아이템의 string에 index를 추가한 key(key={`${opt}-${idx}`})를 부여하여 React의 Reconciliation이 각 노드를 고유하게 식별하도록 교정.
    * options 프로필 배열 자체를 Array.from(new Set(...))으로 데두플리케이션하여 데이터 중복 가능성을 프론트단에서 2중으로 원천 차단함.

# DATT Platform ⚓

DATT(닻)는 사용자가 대표 구역(상권 또는 지하철역 주변)을 설정하여 해당 상권의 트렌디한 명소 정보와 추천 코스를 탐색하고 나만의 닻(Anchor) 코스를 설계하여 보관 및 공유할 수 있는 통합 정박 라이프스타일 플랫폼입니다.

본 저장소는 백엔드(Spring Boot)와 프론트엔드(Next.js), 그리고 역방향 프록시(Nginx) 설정을 포함하는 모노레포 구조로 되어 있습니다.

---

## 🛠️ 기술 스택 (Technology Stack)

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Database**: PostgreSQL
- **Security**: Spring Security, JWT (Json Web Token)
- **Build Tool**: Gradle

### Frontend
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Vanilla CSS / TailwindCSS
- **State/Query**: Zustand, React Query

---

## 📂 프로젝트 구조 (Project Structure)

```text
datt-platform/
├── spring-boot-app/     # Spring Boot 백엔드 애플리케이션
├── next-js-app/         # Next.js 프론트엔드 애플리케이션
├── nginx/               # Nginx 리버스 프록시 설정 파일
├── docker-compose.yml   # 컨테이너 오케스트레이션 설정 (PostgreSQL, Nginx, App 등)
└── README.md            # 본 안내 문서
```

---

## 🔒 환경 변수 설정 (Environment Variables)

보안을 위해 API 키 및 DB 비밀번호 등의 민감한 정보는 실제 저장소에 커밋되지 않습니다. 실행 전에 각 프로젝트 디렉토리에 환경 변수 파일을 생성해 주어야 합니다.

### 1. Backend 환경 변수 (`spring-boot-app/src/main/resources/application.yml` 또는 시스템 환경 변수)
아래의 템플릿을 참고하여 로컬 설정에 맞게 민감 정보를 설정합니다. **(실제 자격 증명 정보는 제외되어 있습니다)**

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/datt_db
    username: your_db_user          # 데이터베이스 사용자 계정
    password: your_db_password      # 데이터베이스 사용자 패스워드
  security:
    oauth2:
      client:
        registration:
          kakao:
            client-id: your_kakao_client_id          # 카카오 OAuth Client ID
            client-secret: your_kakao_client_secret  # 카카오 OAuth Client Secret


jwt:
  secret: your_jwt_secret_key_should_be_long_enough  # JWT 토큰 서명용 비밀키
```

### 2. Frontend 환경 변수 (`next-js-app/.env.local`)
프론트엔드 루트 폴더에 `.env.local` 파일을 생성하고 아래 내용을 입력합니다.

```env
# API Base URL (Nginx 프록시 혹은 백엔드 주소)
NEXT_PUBLIC_API_URL=http://localhost:8080

# 카카오 지도 API JavaScript 앱 키 (카카오 개발자 콘솔 발급)
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your_kakao_map_javascript_app_key
```

---

## 🚀 로컬 구동 가이드 (Local Execution Guide)

### Prerequisites
- Docker 및 Docker Compose
- Node.js 18+ & npm
- JDK 17 & Gradle 8.x

### 방법 A. Docker Compose 통합 구동 (추천)
모든 서비스(데이터베이스, Nginx, 백엔드, 프론트엔드)를 컨테이너 환경에서 원클릭으로 통합 구동합니다.

1. **루트 디렉토리**에서 다음 명령을 실행합니다.
   ```bash
   docker-compose up --build -d
   ```
2. 웹 브라우저에서 `http://localhost` 에 접속하여 서비스를 이용합니다. (Nginx 포트 80 기본 바인딩)

### 방법 B. 로컬 개별 구동 (개발용)

#### 1. 데이터베이스 구동
Docker를 이용해 PostgreSQL만 단독 구동합니다.
```bash
docker run --name datt-postgres -e POSTGRES_DB=datt_db -e POSTGRES_USER=your_db_user -e POSTGRES_PASSWORD=your_db_password -p 5432:5432 -d postgres:15
```

#### 2. Backend (Spring Boot) 실행
`spring-boot-app` 디렉토리로 이동하여 빌드 및 실행합니다.
```bash
cd spring-boot-app
./gradlew bootRun
```
- 백엔드 서버는 기본적으로 `http://localhost:8080` 포트에서 실행됩니다.

#### 3. Frontend (Next.js) 실행
`next-js-app` 디렉토리로 이동하여 의존성을 설치하고 개발 서버를 켭니다.
```bash
cd next-js-app
npm install
npm run dev
```
- 프론트엔드 개발 서버는 기본적으로 `http://localhost:3000` 포트에서 실행됩니다.

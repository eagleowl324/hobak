# 🎃 호박 (Hobak) — 우리 동네 중고거래 웹서비스

동네 기반 중고거래 웹서비스 **호박(Hobak)** 프로젝트입니다.  
상품목록, 상품상세, 글쓰기(등록·수정) 3개의 핵심 화면을 통합 SPA와 단독 페이지로 모두 지원하며, **Supabase(Auth + PostgreSQL)**, **Antigravity Spatial 3D / Glassmorphism UI**, **StyleSeed Design System(`ui-setup`)**이 적용되어 있습니다.

---

## ✨ 주요 기능

1. **상품목록 (`list.html` / `#list`)**
   - 동네별 필터, 카테고리 칩 필터, 실시간 키워드 검색 및 인기 검색어 사이드바
   - **`✓ 거래가능만 보기`** 필터(`판매중` / `거래가능` 매물만 표시, `예약중`·`거래완료` 제외)
   - 카드별 거래 상태 태그(`판매중` · `예약중` · `거래완료`) 표시 및 `거래완료` 상품 흐림(`.is-sold`) 처리
   - 정렬(최신순 · 인기순 · 낮은 가격순 · 높은 가격순) 및 페이지네이션

2. **상품상세 (`detail.html` / `#detail`)**
   - 멀티 이미지 슬라이더(좌/우 버튼 및 인디케이터), 판매자 프로필 및 매너온도 툴팁
   - 관심(하트 `♡`/`♥`) 토글, 조회수 실시간 증가, 바로구매/채팅 안내
   - **작성자 전용 관리 패널**: 내가 올린 게시글에서는 **`수정`**, **`삭제`**, **`판매중` / `예약중` / `거래완료`** 상태 전환 버튼 제공

3. **글쓰기 · 수정 (`write.html` / `#write`)**
   - 상품상세 페이지 레이아웃을 계승한 카드형 에디터
   - 내 PC 이미지 업로드, 이미지 URL 추가, 원클릭 샘플 프리셋 지원
   - 비로그인 시 로그인 모달 선행 노출 후 글쓰기 자동 진입, 재진입 시 기존 입력값 자동 초기화

4. **Supabase Auth & PII-Free 데이터베이스 연동**
   - 이메일·비밀번호 회원가입(닉네임 필수) 및 로그인 모달, 우측 상단 인증 버튼 자동 전환
   - 개인 식별 정보(이메일·전화번호·실명)를 `public` 스키마에 직접 저장하지 않는 4개 테이블(`profiles`, `items`, `item_likes`, `popular_keywords`) 구조

5. **디자인 시스템 (`Antigravity Design` & `StyleSeed UI Setup`)**
   - GSAP 기반 무중력 부유, 3D 마그네틱 카드 틸트, 글래스모피즘, `🧊 3D 아이소메트릭 뷰` 전환
   - 4단계 **`🎨 UI Setup`** 위저드 (4종 브랜드 스킨, 라이트/다크 모드, 곡률 및 타이포그래피 스케일)

---

## 📁 프로젝트 구조

```text
hobak/
├── index.html                 # 통합 웹서비스 진입점 (목록 · 상세 · 글쓰기 SPA)
├── list.html                  # 상품목록 단독 페이지
├── detail.html                # 상품상세 단독 페이지
├── write.html                 # 글쓰기/수정 단독 페이지
├── DESIGN.md                  # StyleSeed 디자인 시스템 명세서
├── .env.example               # 환경변수 템플릿 (실제 키는 .env에서 관리)
├── .gitignore                 # 시크릿(.env) 및 임시 파일 제외 규칙
├── server.ps1                 # 로컬 정적 웹 서버 실행 스크립트 (PowerShell)
├── css/
│   ├── common.css             # 공통 토큰 및 토스트 스타일
│   ├── app.css                # 통합 사이트 글로벌 네비게이션 및 스테이지 레이아웃
│   ├── list.css               # 상품목록 스타일
│   ├── detail.css             # 상품상세 및 작성자 관리 패널 스타일
│   ├── write.css              # 글쓰기 카드형 에디터 스타일
│   ├── auth.css               # 로그인/회원가입 모달 및 상단 인증 바 스타일
│   ├── antigravity-design.css # 3D Spatial, Glassmorphism, Isometric 스타일
│   └── theme.css              # 다크 모드, 브랜드 스킨, UI Setup 위저드 스타일
├── js/
│   ├── app.js                 # 통합 라우팅 및 모듈 연결 컨트롤러
│   ├── auth.js                # Supabase Auth 인증 및 모달 관리
│   ├── list.js                # 상품목록 렌더링 및 필터링
│   ├── detail.js              # 상품상세 및 작성자 상태/수정/삭제 제어
│   ├── write.js               # 글쓰기 및 수정 에디터
│   ├── antigravity-design.js  # GSAP + 3D 틸트 물리 엔진
│   └── ui-setup.js            # 인터랙티브 디자인 토큰 셋업 위저드
├── data/
│   └── mock-data.js           # Supabase REST API 연동 스토어 및 초기 10개 시드 데이터
├── tokens/                    # Design Token JSON 매니페스트 (colors, radii, shadows, spacing, typography)
└── .agent/                    # Antigravity 스킬 정의 및 MCP 템플릿 설정
```

---

## 🚀 로컬 실행 및 배포 방법

### 1. 로컬 실행 (Windows PowerShell)
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\server.ps1 -Port 8080
```
실행 후 브라우저에서 `http://localhost:8080/` 접속

### 2. 정적 웹 호스팅 배포 (GitHub Pages / Vercel / Netlify)
- 별도의 빌드 단계 없이 정적 HTML/CSS/JS 파일만으로 동작합니다.
- 리포지토리 루트를 그대로 배포 소스로 지정하면 바로 서비스됩니다.
- **보안 참고**: 프론트엔드(`data/mock-data.js`, `js/auth.js`)에는 공개용 Supabase `URL` 및 `anon key`만 포함되어 있으며, `SUPABASE_SERVICE_ROLE_KEY` 등 관리자 키는 `.gitignore`로 보호되는 `.env`에만 보관됩니다.

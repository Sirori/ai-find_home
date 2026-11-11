# 아파트 실거래가

카카오맵 위에서 아파트 매매·전월세 실거래가를 조회하는 웹 서비스입니다.

## 주요 기능

- 지도 기반 아파트 탐색 (카카오맵)
- 아파트 이름 검색
- 매매 / 전월세 실거래 내역 조회
- 가격·면적·기간 필터
- 가격 추이 차트

## 기술 스택

- [Next.js](https://nextjs.org) 16 (App Router) · React 19 · TypeScript
- Tailwind CSS 4
- Recharts
- 카카오맵 JavaScript SDK · 카카오 로컬 API
- 공공데이터포털 국토교통부 아파트 실거래가 API

## 시작하기

### 1. API 키 발급

| 환경변수 | 발급처 | 용도 |
| --- | --- | --- |
| `SERVICE_KEY` | [공공데이터포털](https://www.data.go.kr) — 국토교통부 아파트 매매 실거래가 자료, 아파트 전월세 실거래가 자료 (두 API 모두 활용 신청) | 실거래가 조회 |
| `KAKAO_REST_KEY` | [Kakao Developers](https://developers.kakao.com) — 앱 > 앱 키 > REST API 키 | 장소 검색, 좌표→행정구역 변환 |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | [Kakao Developers](https://developers.kakao.com) — 앱 > 앱 키 > JavaScript 키 | 카카오맵 표시 |

> 카카오 JavaScript 키를 사용하려면 Kakao Developers의 **플랫폼 > Web**에 사이트 도메인(예: `http://localhost:8000`)을 등록해야 합니다.

### 2. 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local`을 열어 발급받은 키를 입력합니다. 이 파일은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.

### 3. 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:8000](http://localhost:8000) 을 엽니다.

## 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 (포트 8000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |

## 프로젝트 구조

```text
src/
├── app/
│   ├── api/
│   │   ├── trade/            # 매매 실거래가 (공공데이터 API 프록시)
│   │   ├── rent/             # 전월세 실거래가 (공공데이터 API 프록시)
│   │   ├── search/           # 아파트 검색 (카카오 로컬)
│   │   ├── geocode/          # 키워드 → 좌표
│   │   └── reverse-geocode/  # 좌표 → 행정구역
│   ├── layout.tsx
│   └── page.tsx
├── components/               # 지도, 검색바, 필터, 거래 목록, 차트 등
├── lib/                      # 카카오맵 로더, 유틸
└── types/
```

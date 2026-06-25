# 재해예방 기술지도 지원 웹 시스템

재해예방 전문지도기관을 위한 **기술지도 관리 웹 시스템**입니다.
사업장·지도위원·방문 일정·지적사항(개선조치)을 한 곳에서 관리합니다.

> Stack: **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase(Postgres) · Vercel**

## 주요 기능

- **대시보드** — 관리 사업장 수, 이번달 방문, 미조치 지적사항, 조치 완료율
- **사업장 관리** — 사업장 등록/조회, 담당 지도위원 배정, 방문 이력
- **지도위원 관리** — 지도위원 등록/조회 (전문분야·담당지역)
- **기술지도 방문** — 방문 일정 등록, 정기/수시 구분, 상태 관리
- **지적사항** — 위험분야·위험도(상/중/하)·개선대책·조치기한, 조치완료 토글

## 빠른 시작

### 1) 의존성 설치

```bash
cd web
npm install
```

### 2) Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com/dashboard) 에서 새 프로젝트 생성
2. **SQL Editor** 에서 `supabase/migrations/0001_init.sql` 실행 (테이블 + RLS 생성)
3. (선택) `supabase/seed.sql` 실행 — 샘플 데이터
4. **Project Settings → API** 에서 `Project URL` 과 `anon public` 키 복사

### 3) 환경변수 설정

`.env.example` 을 복사해 `.env.local` 생성:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4) 개발 서버 실행

```bash
npm run dev
# http://localhost:3000
```

## Vercel 배포

1. 이 저장소를 GitHub 에 푸시
2. [vercel.com](https://vercel.com) → **New Project** → 저장소 import
3. **Root Directory** 를 `web` 으로 지정
4. Environment Variables 에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가
5. Deploy

## 데이터 모델

| 테이블 | 설명 |
| --- | --- |
| `consultants` | 지도위원 (전문분야, 담당지역) |
| `clients` | 사업장 (업종, 근로자수, 담당위원) |
| `visits` | 기술지도 방문 (정기/수시, 예정/완료) |
| `findings` | 지적사항 (위험도, 개선대책, 조치기한, 상태) |

## 보안 참고

현재 RLS 정책은 MVP 용으로 **익명 키 전체 접근 허용**입니다.
운영 환경에서는 Supabase Auth 를 도입하고 사용자/역할 기반 RLS 정책으로 교체하세요.

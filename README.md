# devjinlab blog

[devjinlab.com](https://devjinlab.com)의 블로그(`blog.devjinlab.com`) 클라이언트입니다. Supabase를 백엔드로 사용하는 Next.js 앱으로, 글 작성(관리자 전용)·카테고리·태그·댓글(대댓글 포함)을 지원합니다.

## 기술 스택

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) (Postgres, Auth, Storage) — [`@supabase/ssr`](https://supabase.com/docs/guides/auth/server-side/nextjs)로 연동
- [Toast UI Editor](https://ui.toast.com/tui-editor)로 마크다운 작성/렌더링
- 인증: 이메일 매직링크 + Google OAuth

## 시작하기

### 사전 준비

- Node.js, [pnpm](https://pnpm.io)
- [Docker](https://www.docker.com) — 로컬 Supabase 스택 실행용
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`pnpm dlx supabase`로 별도 설치 없이 사용 가능)

### 설치 및 로컬 Supabase 실행

```bash
pnpm install
pnpm dlx supabase start
```

`supabase start`를 실행하면 로컬 Postgres/Auth/Storage 스택이 뜨고, `supabase/migrations/`의 마이그레이션이 자동 적용됩니다. 완료되면 `API_URL`, `ANON_KEY` 등이 출력됩니다.

### 환경 변수

`.env.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL (로컬은 `supabase start` 출력의 `API_URL`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `ADMIN_EMAIL` | 글쓰기 권한을 가질 관리자 이메일. `supabase/migrations`의 `is_admin()` 함수에 하드코딩된 값과 반드시 동일해야 함 |
| `NEXT_PUBLIC_SITE_URL` | (선택) 매직링크/OAuth 콜백에 쓰이는 기준 URL. 비워두면 `window.location.origin`을 사용하므로 로컬에서는 필요 없지만, 배포 시 `https://blog.devjinlab.com`으로 명시적으로 설정 권장. 이 값(+`/auth/callback`)은 Supabase 대시보드의 Authentication > URL Configuration > Redirect URLs에도 반드시 등록해야 함 — 등록돼 있지 않으면 GoTrue가 요청을 무시하고 자체 설정된 Site URL로 조용히 되돌아감 |

### 개발 서버 실행

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 스크립트

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 실행 |
| `pnpm lint` | ESLint 검사 |
| `pnpm format` | Prettier로 포맷팅 |
| `pnpm typecheck` | TypeScript 타입 검사 |

## 프로젝트 구조

```
app/
  page.tsx                    홈(발행글 목록)
  posts/[slug]/                글 상세 + 댓글
  categories/, tags/           카테고리·태그 인덱스 및 필터 목록
  write/, write/[id]/          글 작성/수정 (관리자 전용)
  login/, auth/                로그인, OAuth 콜백/로그아웃
components/
  blog/                        글/댓글/에디터 관련 컴포넌트
  layout/                      헤더, 모바일 내비게이션
  ui/                          shadcn/ui 컴포넌트
lib/
  blog/                        posts/categories/tags/comments 데이터 조회 함수
  comments/                    댓글 트리 빌드 유틸
  supabase/                    브라우저·서버 Supabase 클라이언트
  auth/                        관리자 판별 유틸
supabase/
  migrations/                  DB 스키마, RLS 정책, 트리거
```

## 데이터베이스

스키마·RLS 정책은 `supabase/migrations/`에 SQL로 관리됩니다. 글쓰기 권한은 애플리케이션 코드가 아니라 Postgres RLS(`is_admin()`)가 직접 강제하며, `ADMIN_EMAIL` 환경 변수는 UI 표시(글쓰기 버튼 노출 여부 등) 용도로만 쓰입니다.

새 마이그레이션은 다음 명령으로 생성합니다.

```bash
pnpm dlx supabase migration new <name>
```

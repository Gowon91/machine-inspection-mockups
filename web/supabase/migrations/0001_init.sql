-- 재해예방 기술지도 지원 웹 시스템 — 초기 스키마
-- Supabase SQL Editor 에 그대로 붙여넣어 실행하세요.

create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────
-- 지도위원 (기술지도를 수행하는 전문가)
-- ────────────────────────────────────────────────
create table if not exists consultants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  email       text,
  specialty   text,                       -- 전문분야 (안전/보건)
  region      text,                        -- 담당 지역
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────
-- 사업장 (기술지도 대상 사업장)
-- ────────────────────────────────────────────────
create table if not exists clients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,             -- 사업장명
  biz_number    text,                      -- 사업자등록번호
  industry      text,                      -- 업종 (건설/제조 등)
  address       text,                      -- 소재지
  contact_name  text,                      -- 담당자
  contact_phone text,                      -- 담당자 연락처
  worker_count  integer,                   -- 상시 근로자 수
  contract_type text default '정기',       -- 계약유형 (정기/수시)
  consultant_id uuid references consultants(id) on delete set null,
  status        text not null default '진행중',  -- 진행중/종료
  created_at    timestamptz not null default now()
);

-- ────────────────────────────────────────────────
-- 기술지도 방문
-- ────────────────────────────────────────────────
create table if not exists visits (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients(id) on delete cascade,
  consultant_id uuid references consultants(id) on delete set null,
  visit_date    date not null,
  visit_type    text not null default '정기',   -- 정기/수시
  status        text not null default '예정',   -- 예정/완료
  summary       text,                            -- 지도 총평
  created_at    timestamptz not null default now()
);

-- ────────────────────────────────────────────────
-- 지적사항 (방문 시 발견한 위험요인 및 개선사항)
-- ────────────────────────────────────────────────
create table if not exists findings (
  id                 uuid primary key default gen_random_uuid(),
  visit_id           uuid not null references visits(id) on delete cascade,
  category           text,                        -- 분야 (추락/기계/전기/화재/보건 등)
  description        text not null,               -- 지적사항 내용
  risk_level         text not null default '중',  -- 위험도 (상/중/하)
  corrective_action  text,                        -- 개선대책
  due_date           date,                        -- 조치기한
  status             text not null default '미조치',  -- 미조치/조치완료
  created_at         timestamptz not null default now()
);

create index if not exists idx_clients_consultant on clients(consultant_id);
create index if not exists idx_visits_client       on visits(client_id);
create index if not exists idx_visits_date         on visits(visit_date);
create index if not exists idx_findings_visit      on findings(visit_id);
create index if not exists idx_findings_status     on findings(status);

-- ────────────────────────────────────────────────
-- RLS (MVP: 익명 키로 전체 접근 허용 — 운영 시 인증 정책으로 교체 권장)
-- ────────────────────────────────────────────────
alter table consultants enable row level security;
alter table clients     enable row level security;
alter table visits      enable row level security;
alter table findings    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['consultants','clients','visits','findings'] loop
    execute format('drop policy if exists "allow all" on %I;', t);
    execute format('create policy "allow all" on %I for all using (true) with check (true);', t);
  end loop;
end $$;

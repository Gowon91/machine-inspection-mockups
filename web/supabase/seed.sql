-- 샘플 데이터 (선택) — 0001_init.sql 실행 후 붙여넣어 실행하세요.

insert into consultants (name, phone, email, specialty, region) values
  ('김재해', '010-1111-2222', 'kim@example.com', '건설안전', '부산'),
  ('이보건', '010-3333-4444', 'lee@example.com', '산업보건', '경남'),
  ('박전기', '010-5555-6666', 'park@example.com', '전기안전', '울산');

-- 사업장 (지도위원과 연결)
with c as (select id, name from consultants)
insert into clients (name, biz_number, industry, address, contact_name, contact_phone, worker_count, contract_type, consultant_id, status)
values
  ('대한건설(주)', '123-45-67890', '종합건설업', '부산광역시 사상구', '정현장', '010-1234-5678', 85, '정기',
    (select id from c where name='김재해'), '진행중'),
  ('한빛제조', '234-56-78901', '금속가공', '경남 김해시', '최공장', '010-2345-6789', 42, '정기',
    (select id from c where name='이보건'), '진행중'),
  ('우진전기설비', '345-67-89012', '전기공사업', '울산광역시 남구', '강설비', '010-3456-7890', 18, '수시',
    (select id from c where name='박전기'), '진행중');

-- 방문 + 지적사항
with v as (
  insert into visits (client_id, consultant_id, visit_date, visit_type, status, summary)
  select cl.id, cl.consultant_id, current_date - interval '7 day', '정기', '완료', '전반적 양호하나 추락방지 조치 보완 필요'
  from clients cl where cl.name='대한건설(주)'
  returning id
)
insert into findings (visit_id, category, description, risk_level, corrective_action, due_date, status)
select v.id, '추락', '개구부 안전난간 미설치', '상', '안전난간 및 덮개 설치', current_date + interval '7 day', '미조치' from v
union all
select v.id, '기계', '이동식 사다리 고정상태 불량', '중', '아웃트리거 설치 및 결속', current_date + interval '10 day', '미조치' from v;

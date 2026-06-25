export default function SetupNotice() {
  return (
    <div className="card mx-auto mt-10 max-w-2xl p-8">
      <h2 className="text-lg font-bold text-slate-800">⚙️ Supabase 설정이 필요합니다</h2>
      <p className="mt-2 text-sm text-slate-600">
        데이터를 표시하려면 Supabase 프로젝트를 연결하세요.
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
        <li>
          <a
            href="https://supabase.com/dashboard"
            className="text-brand underline"
            target="_blank"
            rel="noreferrer"
          >
            supabase.com
          </a>{" "}
          에서 새 프로젝트를 생성합니다.
        </li>
        <li>
          SQL Editor 에서{" "}
          <code className="rounded bg-slate-100 px-1">
            supabase/migrations/0001_init.sql
          </code>{" "}
          을 실행합니다. (샘플 데이터는 <code className="rounded bg-slate-100 px-1">supabase/seed.sql</code>)
        </li>
        <li>
          Project Settings → API 에서 URL 과 anon key 를 복사해{" "}
          <code className="rounded bg-slate-100 px-1">.env.local</code> 에 입력합니다.
        </li>
        <li>
          <code className="rounded bg-slate-100 px-1">npm run dev</code> 로 다시 실행합니다.
        </li>
      </ol>
    </div>
  );
}

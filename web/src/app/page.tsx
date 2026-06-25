import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import SetupNotice from "@/components/SetupNotice";
import { PageHeader, StatCard, Badge } from "@/components/ui";
import { fmtDate, riskBadge, statusBadge } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const supabase = createClient();

  const [clientsRes, visitsRes, findingsRes] = await Promise.all([
    supabase.from("clients").select("id, status"),
    supabase.from("visits").select("id, status, visit_date"),
    supabase.from("findings").select("id, status, risk_level, description, due_date, category"),
  ]);

  const clients = clientsRes.data ?? [];
  const visits = visitsRes.data ?? [];
  const findings = findingsRes.data ?? [];

  const now = new Date();
  const thisMonthVisits = visits.filter((v) => {
    const d = new Date(v.visit_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const openFindings = findings.filter((f) => f.status === "미조치");
  const doneFindings = findings.filter((f) => f.status === "조치완료");
  const completionRate =
    findings.length > 0
      ? Math.round((doneFindings.length / findings.length) * 100)
      : 0;

  const overdue = openFindings.filter(
    (f) => f.due_date && new Date(f.due_date) < now,
  );

  return (
    <div>
      <PageHeader
        title="대시보드"
        description="재해예방 기술지도 현황을 한눈에 확인하세요."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="관리 사업장"
          value={clients.filter((c) => c.status === "진행중").length}
          hint={`전체 ${clients.length}개소`}
          href="/clients"
        />
        <StatCard
          label="이번달 방문"
          value={thisMonthVisits.length}
          hint={`완료 ${thisMonthVisits.filter((v) => v.status === "완료").length}건`}
          href="/visits"
        />
        <StatCard
          label="미조치 지적사항"
          value={openFindings.length}
          hint={`기한초과 ${overdue.length}건`}
        />
        <StatCard label="조치 완료율" value={`${completionRate}%`} hint={`${doneFindings.length}/${findings.length}건`} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">미조치 지적사항</h2>
            <Link href="/visits" className="text-xs text-brand hover:underline">
              전체보기
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {openFindings.slice(0, 6).map((f) => (
              <li key={f.id} className="flex items-center gap-3 py-3">
                <Badge className={riskBadge(f.risk_level)}>{f.risk_level}</Badge>
                <span className="flex-1 truncate text-sm text-slate-700">
                  {f.category ? `[${f.category}] ` : ""}
                  {f.description}
                </span>
                <span className="text-xs text-slate-400">기한 {fmtDate(f.due_date)}</span>
              </li>
            ))}
            {openFindings.length === 0 && (
              <li className="py-8 text-center text-sm text-slate-400">
                미조치 지적사항이 없습니다 🎉
              </li>
            )}
          </ul>
        </section>

        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">다가오는 방문</h2>
            <Link href="/visits" className="text-xs text-brand hover:underline">
              전체보기
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {visits
              .filter((v) => v.status === "예정")
              .sort((a, b) => a.visit_date.localeCompare(b.visit_date))
              .slice(0, 6)
              .map((v) => (
                <li key={v.id} className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-700">{fmtDate(v.visit_date)}</span>
                  <Badge className={statusBadge(v.status)}>{v.status}</Badge>
                </li>
              ))}
            {visits.filter((v) => v.status === "예정").length === 0 && (
              <li className="py-8 text-center text-sm text-slate-400">
                예정된 방문이 없습니다.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

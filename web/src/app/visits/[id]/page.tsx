import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import SetupNotice from "@/components/SetupNotice";
import { PageHeader, Badge, EmptyRow } from "@/components/ui";
import { fmtDate, riskBadge, statusBadge } from "@/lib/format";
import {
  addFinding,
  toggleFinding,
  updateVisitStatus,
} from "../actions";
import type { Finding, Visit } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORIES = ["추락", "기계", "전기", "화재/폭발", "붕괴", "보건", "기타"];

export default async function VisitDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const supabase = createClient();
  const { data: visit } = await supabase
    .from("visits")
    .select("*, clients(id, name), consultants(name)")
    .eq("id", params.id)
    .single();

  if (!visit) notFound();

  const v = visit as Visit & {
    clients: { id: string; name: string } | null;
    consultants: { name: string } | null;
  };

  const { data: findingsData } = await supabase
    .from("findings")
    .select("*")
    .eq("visit_id", params.id)
    .order("created_at", { ascending: true });
  const findings = (findingsData ?? []) as Finding[];

  return (
    <div>
      <div className="mb-4">
        <Link
          href={v.clients ? `/clients/${v.clients.id}` : "/visits"}
          className="text-sm text-brand hover:underline"
        >
          ← {v.clients?.name ?? "방문 목록"}
        </Link>
      </div>
      <PageHeader
        title={`${v.clients?.name ?? "방문"} · ${fmtDate(v.visit_date)}`}
        description={`${v.visit_type} 기술지도 · 담당 ${v.consultants?.name ?? "-"}`}
        action={<Badge className={statusBadge(v.status)}>{v.status}</Badge>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 지적사항 목록 */}
        <section className="card overflow-hidden lg:col-span-2">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-800">지적사항 ({findings.length})</h2>
          </div>
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="th">분야</th>
                <th className="th">위험도</th>
                <th className="th">지적사항 / 개선대책</th>
                <th className="th">기한</th>
                <th className="th">조치</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {findings.map((f) => (
                <tr key={f.id}>
                  <td className="td">{f.category ?? "-"}</td>
                  <td className="td">
                    <Badge className={riskBadge(f.risk_level)}>{f.risk_level}</Badge>
                  </td>
                  <td className="td">
                    <div className="font-medium text-slate-800">{f.description}</div>
                    {f.corrective_action && (
                      <div className="mt-0.5 text-xs text-slate-500">
                        ↳ {f.corrective_action}
                      </div>
                    )}
                  </td>
                  <td className="td whitespace-nowrap">{fmtDate(f.due_date)}</td>
                  <td className="td">
                    <form action={toggleFinding}>
                      <input type="hidden" name="id" value={f.id} />
                      <input type="hidden" name="visit_id" value={v.id} />
                      <input type="hidden" name="current" value={f.status} />
                      <button
                        type="submit"
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(f.status)}`}
                        title="클릭하여 상태 변경"
                      >
                        {f.status}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {findings.length === 0 && (
                <EmptyRow colSpan={5} text="등록된 지적사항이 없습니다." />
              )}
            </tbody>
          </table>
        </section>

        <div className="space-y-6">
          {/* 지적사항 추가 */}
          <section className="card h-fit p-5">
            <h2 className="mb-4 font-semibold text-slate-800">지적사항 추가</h2>
            <form action={addFinding} className="space-y-3">
              <input type="hidden" name="visit_id" value={v.id} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">분야</label>
                  <select name="category" className="input">
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">위험도</label>
                  <select name="risk_level" className="input" defaultValue="중">
                    <option value="상">상</option>
                    <option value="중">중</option>
                    <option value="하">하</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">지적사항 *</label>
                <textarea
                  name="description"
                  required
                  rows={2}
                  className="input"
                  placeholder="개구부 안전난간 미설치"
                />
              </div>
              <div>
                <label className="label">개선대책</label>
                <textarea
                  name="corrective_action"
                  rows={2}
                  className="input"
                  placeholder="안전난간 및 덮개 설치"
                />
              </div>
              <div>
                <label className="label">조치기한</label>
                <input name="due_date" type="date" className="input" />
              </div>
              <button type="submit" className="btn w-full">
                추가
              </button>
            </form>
          </section>

          {/* 방문 상태 / 총평 */}
          <section className="card h-fit p-5">
            <h2 className="mb-4 font-semibold text-slate-800">방문 정보 수정</h2>
            <form action={updateVisitStatus} className="space-y-3">
              <input type="hidden" name="id" value={v.id} />
              <div>
                <label className="label">상태</label>
                <select name="status" className="input" defaultValue={v.status}>
                  <option value="예정">예정</option>
                  <option value="완료">완료</option>
                </select>
              </div>
              <div>
                <label className="label">지도 총평</label>
                <textarea
                  name="summary"
                  rows={3}
                  className="input"
                  defaultValue={v.summary ?? ""}
                  placeholder="전반적 양호하나 추락방지 조치 보완 필요"
                />
              </div>
              <button type="submit" className="btn-ghost w-full">
                저장
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

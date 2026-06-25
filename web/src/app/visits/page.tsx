import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import SetupNotice from "@/components/SetupNotice";
import { PageHeader, Badge, EmptyRow } from "@/components/ui";
import { fmtDate, statusBadge } from "@/lib/format";
import { createVisit } from "./actions";
import type { Client, Visit } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VisitsPage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const supabase = createClient();
  const [visitsRes, clientsRes] = await Promise.all([
    supabase
      .from("visits")
      .select("*, clients(name), findings(id, status)")
      .order("visit_date", { ascending: false }),
    supabase.from("clients").select("id, name").order("name"),
  ]);

  const visits = (visitsRes.data ?? []) as (Visit & {
    clients: { name: string } | null;
    findings: { id: string; status: string }[];
  })[];
  const clients = (clientsRes.data ?? []) as Pick<Client, "id" | "name">[];

  return (
    <div>
      <PageHeader
        title="기술지도 방문"
        description="방문 일정과 지적사항을 관리합니다."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card overflow-hidden lg:col-span-2">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="th">방문일</th>
                <th className="th">사업장</th>
                <th className="th">유형</th>
                <th className="th">지적사항</th>
                <th className="th">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visits.map((v) => {
                const open = v.findings.filter((f) => f.status === "미조치").length;
                return (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="td">
                      <Link href={`/visits/${v.id}`} className="text-brand hover:underline">
                        {fmtDate(v.visit_date)}
                      </Link>
                    </td>
                    <td className="td">{v.clients?.name ?? "-"}</td>
                    <td className="td">{v.visit_type}</td>
                    <td className="td">
                      {v.findings.length}건
                      {open > 0 && (
                        <span className="ml-1 text-xs text-amber-600">
                          (미조치 {open})
                        </span>
                      )}
                    </td>
                    <td className="td">
                      <Badge className={statusBadge(v.status)}>{v.status}</Badge>
                    </td>
                  </tr>
                );
              })}
              {visits.length === 0 && (
                <EmptyRow colSpan={5} text="등록된 방문이 없습니다." />
              )}
            </tbody>
          </table>
        </section>

        <section className="card h-fit p-5">
          <h2 className="mb-4 font-semibold text-slate-800">방문 등록</h2>
          {clients.length === 0 ? (
            <p className="text-sm text-slate-500">
              먼저{" "}
              <Link href="/clients" className="text-brand underline">
                사업장
              </Link>
              을 등록하세요.
            </p>
          ) : (
            <form action={createVisit} className="space-y-3">
              <div>
                <label className="label">사업장 *</label>
                <select name="client_id" required className="input">
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">방문일 *</label>
                <input name="visit_date" type="date" required className="input" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">유형</label>
                  <select name="visit_type" className="input">
                    <option value="정기">정기</option>
                    <option value="수시">수시</option>
                  </select>
                </div>
                <div>
                  <label className="label">상태</label>
                  <select name="status" className="input">
                    <option value="예정">예정</option>
                    <option value="완료">완료</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn w-full">
                등록
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

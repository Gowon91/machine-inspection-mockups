import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import SetupNotice from "@/components/SetupNotice";
import { PageHeader, Badge, EmptyRow } from "@/components/ui";
import { fmtDate, statusBadge } from "@/lib/format";
import type { Client, Consultant, Visit } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const supabase = createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("*, consultants(name, phone, specialty)")
    .eq("id", params.id)
    .single();

  if (!client) notFound();

  const c = client as Client & {
    consultants: Pick<Consultant, "name" | "phone" | "specialty"> | null;
  };

  const { data: visitsData } = await supabase
    .from("visits")
    .select("*")
    .eq("client_id", params.id)
    .order("visit_date", { ascending: false });
  const visits = (visitsData ?? []) as Visit[];

  const info: [string, string][] = [
    ["사업자등록번호", c.biz_number ?? "-"],
    ["업종", c.industry ?? "-"],
    ["소재지", c.address ?? "-"],
    ["상시 근로자", c.worker_count != null ? `${c.worker_count}명` : "-"],
    ["담당자", c.contact_name ?? "-"],
    ["담당자 연락처", c.contact_phone ?? "-"],
    ["계약유형", c.contract_type ?? "-"],
    ["담당 지도위원", c.consultants?.name ?? "-"],
  ];

  return (
    <div>
      <div className="mb-4">
        <Link href="/clients" className="text-sm text-brand hover:underline">
          ← 사업장 목록
        </Link>
      </div>
      <PageHeader
        title={c.name}
        action={<Badge className={statusBadge(c.status)}>{c.status}</Badge>}
      />

      <section className="card mb-6 p-6">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-4">
          {info.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-slate-400">{k}</dt>
              <dd className="mt-1 text-sm font-medium text-slate-700">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">기술지도 이력</h2>
        </div>
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="th">방문일</th>
              <th className="th">유형</th>
              <th className="th">상태</th>
              <th className="th">총평</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visits.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className="td">{fmtDate(v.visit_date)}</td>
                <td className="td">{v.visit_type}</td>
                <td className="td">
                  <Badge className={statusBadge(v.status)}>{v.status}</Badge>
                </td>
                <td className="td max-w-xs truncate">{v.summary ?? "-"}</td>
                <td className="td text-right">
                  <Link href={`/visits/${v.id}`} className="text-brand hover:underline">
                    상세
                  </Link>
                </td>
              </tr>
            ))}
            {visits.length === 0 && (
              <EmptyRow colSpan={5} text="방문 이력이 없습니다." />
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

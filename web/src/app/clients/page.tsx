import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import SetupNotice from "@/components/SetupNotice";
import { PageHeader, Badge, EmptyRow } from "@/components/ui";
import { statusBadge } from "@/lib/format";
import { createClientRecord } from "./actions";
import type { Client, Consultant } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const supabase = createClient();
  const [clientsRes, consultantsRes] = await Promise.all([
    supabase
      .from("clients")
      .select("*, consultants(name)")
      .order("created_at", { ascending: false }),
    supabase.from("consultants").select("id, name").order("name"),
  ]);

  const clients = (clientsRes.data ?? []) as (Client & {
    consultants: { name: string } | null;
  })[];
  const consultants = (consultantsRes.data ?? []) as Pick<
    Consultant,
    "id" | "name"
  >[];

  return (
    <div>
      <PageHeader
        title="사업장"
        description="기술지도 대상 사업장을 관리합니다."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card overflow-hidden lg:col-span-2">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="th">사업장명</th>
                <th className="th">업종</th>
                <th className="th">담당위원</th>
                <th className="th">근로자</th>
                <th className="th">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="td font-medium">
                    <Link href={`/clients/${c.id}`} className="text-brand hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="td">{c.industry ?? "-"}</td>
                  <td className="td">{c.consultants?.name ?? "-"}</td>
                  <td className="td">{c.worker_count ?? "-"}</td>
                  <td className="td">
                    <Badge className={statusBadge(c.status)}>{c.status}</Badge>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <EmptyRow colSpan={5} text="등록된 사업장이 없습니다." />
              )}
            </tbody>
          </table>
        </section>

        <section className="card h-fit p-5">
          <h2 className="mb-4 font-semibold text-slate-800">사업장 등록</h2>
          <form action={createClientRecord} className="space-y-3">
            <div>
              <label className="label">사업장명 *</label>
              <input name="name" required className="input" placeholder="대한건설(주)" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">업종</label>
                <input name="industry" className="input" placeholder="종합건설업" />
              </div>
              <div>
                <label className="label">근로자 수</label>
                <input name="worker_count" type="number" className="input" placeholder="50" />
              </div>
            </div>
            <div>
              <label className="label">사업자등록번호</label>
              <input name="biz_number" className="input" placeholder="000-00-00000" />
            </div>
            <div>
              <label className="label">소재지</label>
              <input name="address" className="input" placeholder="부산광역시 사상구" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">담당자</label>
                <input name="contact_name" className="input" placeholder="홍길동" />
              </div>
              <div>
                <label className="label">담당자 연락처</label>
                <input name="contact_phone" className="input" placeholder="010-0000-0000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">계약유형</label>
                <select name="contract_type" className="input">
                  <option value="정기">정기</option>
                  <option value="수시">수시</option>
                </select>
              </div>
              <div>
                <label className="label">담당 지도위원</label>
                <select name="consultant_id" className="input">
                  <option value="">선택안함</option>
                  {consultants.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn w-full">
              등록
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

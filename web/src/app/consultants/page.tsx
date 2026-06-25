import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import SetupNotice from "@/components/SetupNotice";
import { PageHeader, EmptyRow } from "@/components/ui";
import { createConsultant } from "./actions";
import type { Consultant } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ConsultantsPage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const supabase = createClient();
  const { data } = await supabase
    .from("consultants")
    .select("*")
    .order("created_at", { ascending: false });
  const consultants = (data ?? []) as Consultant[];

  return (
    <div>
      <PageHeader
        title="지도위원"
        description="기술지도를 수행하는 전문 지도위원을 관리합니다."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card overflow-hidden lg:col-span-2">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="th">이름</th>
                <th className="th">전문분야</th>
                <th className="th">담당지역</th>
                <th className="th">연락처</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {consultants.map((c) => (
                <tr key={c.id}>
                  <td className="td font-medium text-slate-800">{c.name}</td>
                  <td className="td">{c.specialty ?? "-"}</td>
                  <td className="td">{c.region ?? "-"}</td>
                  <td className="td">{c.phone ?? "-"}</td>
                </tr>
              ))}
              {consultants.length === 0 && (
                <EmptyRow colSpan={4} text="등록된 지도위원이 없습니다." />
              )}
            </tbody>
          </table>
        </section>

        <section className="card h-fit p-5">
          <h2 className="mb-4 font-semibold text-slate-800">지도위원 등록</h2>
          <form action={createConsultant} className="space-y-3">
            <div>
              <label className="label">이름 *</label>
              <input name="name" required className="input" placeholder="홍길동" />
            </div>
            <div>
              <label className="label">전문분야</label>
              <input name="specialty" className="input" placeholder="건설안전 / 산업보건" />
            </div>
            <div>
              <label className="label">담당지역</label>
              <input name="region" className="input" placeholder="부산" />
            </div>
            <div>
              <label className="label">연락처</label>
              <input name="phone" className="input" placeholder="010-0000-0000" />
            </div>
            <div>
              <label className="label">이메일</label>
              <input name="email" type="email" className="input" placeholder="name@example.com" />
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

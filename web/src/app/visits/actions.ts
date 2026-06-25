"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createVisit(formData: FormData) {
  const supabase = createClient();
  const clientId = String(formData.get("client_id") || "");
  if (!clientId) return;

  // 사업장의 담당 지도위원을 자동 연결
  const { data: client } = await supabase
    .from("clients")
    .select("consultant_id")
    .eq("id", clientId)
    .single();

  await supabase.from("visits").insert({
    client_id: clientId,
    consultant_id: client?.consultant_id ?? null,
    visit_date: String(formData.get("visit_date") || ""),
    visit_type: String(formData.get("visit_type") || "정기"),
    status: String(formData.get("status") || "예정"),
  });
  revalidatePath("/visits");
  revalidatePath("/");
}

export async function addFinding(formData: FormData) {
  const supabase = createClient();
  const visitId = String(formData.get("visit_id") || "");
  if (!visitId) return;

  await supabase.from("findings").insert({
    visit_id: visitId,
    category: String(formData.get("category") || "").trim() || null,
    description: String(formData.get("description") || "").trim(),
    risk_level: String(formData.get("risk_level") || "중"),
    corrective_action: String(formData.get("corrective_action") || "").trim() || null,
    due_date: String(formData.get("due_date") || "") || null,
  });
  revalidatePath(`/visits/${visitId}`);
  revalidatePath("/");
}

export async function toggleFinding(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id") || "");
  const visitId = String(formData.get("visit_id") || "");
  const current = String(formData.get("current") || "");
  const next = current === "조치완료" ? "미조치" : "조치완료";
  await supabase.from("findings").update({ status: next }).eq("id", id);
  revalidatePath(`/visits/${visitId}`);
  revalidatePath("/");
}

export async function updateVisitStatus(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id") || "");
  await supabase
    .from("visits")
    .update({
      status: String(formData.get("status") || "예정"),
      summary: String(formData.get("summary") || "").trim() || null,
    })
    .eq("id", id);
  revalidatePath(`/visits/${id}`);
  revalidatePath("/");
}

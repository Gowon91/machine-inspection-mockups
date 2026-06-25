"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createClientRecord(formData: FormData) {
  const supabase = createClient();
  const workerRaw = String(formData.get("worker_count") || "").trim();
  await supabase.from("clients").insert({
    name: String(formData.get("name") || "").trim(),
    biz_number: String(formData.get("biz_number") || "").trim() || null,
    industry: String(formData.get("industry") || "").trim() || null,
    address: String(formData.get("address") || "").trim() || null,
    contact_name: String(formData.get("contact_name") || "").trim() || null,
    contact_phone: String(formData.get("contact_phone") || "").trim() || null,
    worker_count: workerRaw ? Number(workerRaw) : null,
    contract_type: String(formData.get("contract_type") || "정기"),
    consultant_id: String(formData.get("consultant_id") || "") || null,
  });
  revalidatePath("/clients");
  revalidatePath("/");
}

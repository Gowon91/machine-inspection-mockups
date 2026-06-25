"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createConsultant(formData: FormData) {
  const supabase = createClient();
  await supabase.from("consultants").insert({
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    specialty: String(formData.get("specialty") || "").trim() || null,
    region: String(formData.get("region") || "").trim() || null,
  });
  revalidatePath("/consultants");
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { ensure, str } from "@/lib/form";

const PAPEIS = ["admin", "editor", "comentarista"];

export async function liberarEmail(fd: FormData) {
  const { supabase } = await requireAdmin();
  const email = str(fd, "email").toLowerCase();
  const papel = str(fd, "papel");
  if (!email.includes("@") || !PAPEIS.includes(papel)) throw new Error("Dados inválidos.");
  ensure((await supabase.from("allowed_emails").upsert({ email, papel })).error);
  await supabase.from("profiles").update({ papel }).eq("email", email);
  revalidatePath("/acesso");
}

export async function removerEmail(fd: FormData) {
  const { supabase, profile } = await requireAdmin();
  const email = str(fd, "email").toLowerCase();
  if (email === profile.email) throw new Error("Você não pode remover o próprio acesso.");
  ensure((await supabase.from("allowed_emails").delete().eq("email", email)).error);
  revalidatePath("/acesso");
}

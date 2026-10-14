import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Papel, Profile } from "@/lib/types";

export const getContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,nome,papel")
    .eq("id", user.id)
    .maybeSingle<Profile>();
  const { data: papelAtual } = await supabase.rpc("papel_atual");
  if (!profile || !papelAtual) throw new Error("Esta conta não tem acesso ao Caderno do Ozzy.");

  const papel = papelAtual as Papel;
  return {
    supabase,
    user,
    profile,
    papel,
    canEdit: papel === "admin" || papel === "editor",
    isAdmin: papel === "admin",
  };
});

export async function requireEditor() {
  const ctx = await getContext();
  if (!ctx.canEdit) throw new Error("Sem permissão para editar.");
  return ctx;
}

export async function requireAdmin() {
  const ctx = await getContext();
  if (!ctx.isAdmin) throw new Error("Apenas administradores.");
  return ctx;
}

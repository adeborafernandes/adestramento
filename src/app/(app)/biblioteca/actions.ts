"use server";

import { revalidatePath } from "next/cache";
import { getContext, requireEditor } from "@/lib/session";
import { ensure, opt, str, urlSegura } from "@/lib/form";

export async function adicionarMaterial(fd: FormData) {
  const { supabase, user } = await getContext();
  const titulo = str(fd, "titulo");
  const url = urlSegura(opt(fd, "url"));
  const descricao = opt(fd, "descricao");
  if (!titulo) return;
  if (!url && !descricao) throw new Error("Informe um link ou escreva uma nota.");
  ensure((await supabase.from("materiais").insert({ titulo, url, descricao, compartilhado_por: user.id })).error);
  revalidatePath("/biblioteca");
}

export async function excluirMaterial(fd: FormData) {
  const { supabase } = await requireEditor();
  ensure((await supabase.from("materiais").delete().eq("id", str(fd, "id"))).error);
  revalidatePath("/biblioteca");
}

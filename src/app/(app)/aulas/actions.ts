"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getContext, requireEditor } from "@/lib/session";
import { ensure, opt, str } from "@/lib/form";
import { hoje, segundaDe } from "@/lib/format";

function campos(fd: FormData) {
  return {
    data: str(fd, "data") || hoje(),
    titulo: str(fd, "titulo") || "Aula",
    resumo: opt(fd, "resumo"),
    anotacoes: opt(fd, "anotacoes"),
    proximos_passos: opt(fd, "proximos_passos"),
  };
}

export async function criarAula(fd: FormData) {
  const { supabase } = await requireEditor();
  const { data, error } = await supabase.from("aulas").insert(campos(fd)).select("id").single();
  ensure(error);
  revalidatePath("/aulas");
  redirect(`/aulas/${data!.id}`);
}

export async function salvarAula(fd: FormData) {
  const { supabase } = await requireEditor();
  const id = str(fd, "id");
  ensure((await supabase.from("aulas").update(campos(fd)).eq("id", id)).error);
  revalidatePath(`/aulas/${id}`);
  revalidatePath("/aulas");
}

export async function excluirAula(fd: FormData) {
  const { supabase } = await requireEditor();
  ensure((await supabase.from("aulas").delete().eq("id", str(fd, "id"))).error);
  revalidatePath("/aulas");
  redirect("/aulas");
}

export async function adicionarLicaoNaAula(fd: FormData) {
  const { supabase } = await requireEditor();
  const aulaId = str(fd, "aula_id");
  const titulo = str(fd, "titulo");
  if (!titulo) return;
  ensure(
    (
      await supabase.from("licoes").insert({
        aula_id: aulaId,
        titulo,
        descricao: opt(fd, "descricao"),
        semana: segundaDe(str(fd, "data") || hoje()),
      })
    ).error,
  );
  revalidatePath(`/aulas/${aulaId}`);
  revalidatePath("/licao");
}

export async function comentar(fd: FormData) {
  const { supabase, user } = await getContext();
  const aulaId = str(fd, "aula_id");
  const texto = str(fd, "texto");
  if (!texto) return;
  ensure((await supabase.from("comentarios").insert({ aula_id: aulaId, texto, autor_id: user.id })).error);
  revalidatePath(`/aulas/${aulaId}`);
}

export async function apagarComentario(fd: FormData) {
  const { supabase } = await getContext();
  const aulaId = str(fd, "aula_id");
  ensure((await supabase.from("comentarios").delete().eq("id", str(fd, "id"))).error);
  revalidatePath(`/aulas/${aulaId}`);
}

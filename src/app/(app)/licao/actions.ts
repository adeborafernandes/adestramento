"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/session";
import { ensure, opt, str } from "@/lib/form";
import { hoje, segundaDe } from "@/lib/format";

const STATUS = ["pendente", "feito", "parcial", "nao_feito"];

export async function atualizarLicao(fd: FormData) {
  const { supabase } = await requireEditor();
  const status = str(fd, "status");
  if (!STATUS.includes(status)) throw new Error("Status inválido.");
  ensure(
    (
      await supabase
        .from("licoes")
        .update({ status, observacao: opt(fd, "observacao"), atualizado_em: new Date().toISOString() })
        .eq("id", str(fd, "id"))
    ).error,
  );
  revalidatePath("/licao");
}

export async function criarLicao(fd: FormData) {
  const { supabase } = await requireEditor();
  const titulo = str(fd, "titulo");
  if (!titulo) return;
  ensure(
    (
      await supabase.from("licoes").insert({
        titulo,
        descricao: opt(fd, "descricao"),
        semana: segundaDe(str(fd, "data") || hoje()),
      })
    ).error,
  );
  revalidatePath("/licao");
}

export async function excluirLicao(fd: FormData) {
  const { supabase } = await requireEditor();
  ensure((await supabase.from("licoes").delete().eq("id", str(fd, "id"))).error);
  revalidatePath("/licao");
}

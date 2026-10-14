"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/session";
import { ensure, opt, str } from "@/lib/form";
import { hoje } from "@/lib/format";

const done = (aba: string) => revalidatePath(`/saude`) ?? aba;

export async function adicionarConsulta(fd: FormData) {
  const { supabase } = await requireEditor();
  ensure(
    (
      await supabase.from("consultas").insert({
        data: str(fd, "data") || hoje(),
        tipo: str(fd, "tipo") || "Consulta",
        veterinario: opt(fd, "veterinario"),
        clinica: opt(fd, "clinica"),
        motivo: opt(fd, "motivo"),
        observacoes: opt(fd, "observacoes"),
        retorno_em: opt(fd, "retorno_em"),
      })
    ).error,
  );
  done("consultas");
}

export async function adicionarExame(fd: FormData) {
  const { supabase, user } = await requireEditor();
  const arquivo = opt(fd, "arquivo_path");
  if (arquivo && !arquivo.startsWith(`${user.id}/`)) throw new Error("Arquivo inválido.");
  ensure(
    (
      await supabase.from("exames").insert({
        data: str(fd, "data") || hoje(),
        nome: str(fd, "nome") || "Exame",
        laboratorio: opt(fd, "laboratorio"),
        resultado: opt(fd, "resultado"),
        observacoes: opt(fd, "observacoes"),
        arquivo_path: arquivo,
      })
    ).error,
  );
  done("exames");
}

export async function adicionarMedicamento(fd: FormData) {
  const { supabase } = await requireEditor();
  ensure(
    (
      await supabase.from("medicamentos").insert({
        nome: str(fd, "nome") || "Medicamento",
        dose: opt(fd, "dose"),
        frequencia: opt(fd, "frequencia"),
        motivo: opt(fd, "motivo"),
        inicio: opt(fd, "inicio"),
        fim: opt(fd, "fim"),
        uso_continuo: fd.get("uso_continuo") === "on",
        observacoes: opt(fd, "observacoes"),
      })
    ).error,
  );
  done("medicamentos");
}

export async function encerrarMedicamento(fd: FormData) {
  const { supabase } = await requireEditor();
  ensure(
    (await supabase.from("medicamentos").update({ fim: hoje() }).eq("id", str(fd, "id"))).error,
  );
  done("medicamentos");
}

const TABELAS = ["consultas", "exames", "medicamentos"] as const;

export async function excluirRegistro(fd: FormData) {
  const { supabase } = await requireEditor();
  const tabela = str(fd, "tabela");
  if (!(TABELAS as readonly string[]).includes(tabela)) throw new Error("Tabela inválida.");
  const id = str(fd, "id");
  if (tabela === "exames") {
    const { data } = await supabase.from("exames").select("arquivo_path").eq("id", id).maybeSingle();
    if (data?.arquivo_path) await supabase.storage.from("clinico").remove([data.arquivo_path]);
  }
  ensure((await supabase.from(tabela).delete().eq("id", id)).error);
  done(tabela);
}

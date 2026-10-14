"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/session";
import { ensure, opt, str, urlSegura } from "@/lib/form";
import { hoje } from "@/lib/format";

export async function adicionarVideo(fd: FormData) {
  const { supabase, user } = await requireEditor();
  const arquivo = opt(fd, "arquivo_path");
  const url = urlSegura(opt(fd, "url_externa"));
  if (arquivo && !arquivo.startsWith(`${user.id}/`)) throw new Error("Arquivo inválido.");
  if (!arquivo && !url) throw new Error("Envie um arquivo ou informe um link.");
  ensure(
    (
      await supabase.from("videos").insert({
        titulo: str(fd, "titulo") || "Vídeo",
        descricao: opt(fd, "descricao"),
        data: str(fd, "data") || hoje(),
        arquivo_path: arquivo,
        url_externa: arquivo ? null : url,
      })
    ).error,
  );
  revalidatePath("/videos");
}

export async function excluirVideo(fd: FormData) {
  const { supabase } = await requireEditor();
  const id = str(fd, "id");
  const { data } = await supabase.from("videos").select("arquivo_path").eq("id", id).maybeSingle();
  if (data?.arquivo_path) await supabase.storage.from("videos").remove([data.arquivo_path]);
  ensure((await supabase.from("videos").delete().eq("id", id)).error);
  revalidatePath("/videos");
}

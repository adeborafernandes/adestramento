"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Envia o arquivo direto do navegador para o Supabase Storage e guarda o caminho num campo oculto. */
export default function FileUploader({
  bucket, name, accept, userId, label, maxMB,
}: {
  bucket: "videos" | "clinico";
  name: string;
  accept: string;
  userId: string;
  label: string;
  maxMB: number;
}) {
  const [path, setPath] = useState("");
  const [msg, setMsg] = useState<{ tipo: "ok" | "bad" | "info"; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPath("");
    if (!file) return setMsg(null);
    if (file.size > maxMB * 1024 * 1024) {
      e.target.value = "";
      return setMsg({ tipo: "bad", texto: `Arquivo maior que ${maxMB} MB. Use a opção de link.` });
    }
    setEnviando(true);
    setMsg({ tipo: "info", texto: "Enviando…" });
    const seguro = file.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "_");
    const destino = `${userId}/${crypto.randomUUID()}-${seguro}`;
    const { error } = await createClient().storage.from(bucket).upload(destino, file, {
      contentType: file.type || undefined,
    });
    setEnviando(false);
    if (error) return setMsg({ tipo: "bad", texto: "Não foi possível enviar. Tente de novo." });
    setPath(destino);
    setMsg({ tipo: "ok", texto: "Arquivo enviado." });
  }

  return (
    <div className="field">
      <label htmlFor={`f-${name}`}>{label}</label>
      <input id={`f-${name}`} type="file" accept={accept} onChange={escolher} disabled={enviando} />
      <input type="hidden" name={name} value={path} />
      {msg && (
        <p className={`small ${msg.tipo === "bad" ? "alert alert-bad" : msg.tipo === "ok" ? "alert alert-ok" : "muted"}`} style={{ marginTop: 8 }} role="status">
          {msg.texto}
        </p>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { getContext } from "@/lib/session";
import { fmtData } from "@/lib/format";
import Prose from "@/components/Prose";
import type { Material } from "@/lib/types";
import { adicionarMaterial, excluirMaterial } from "./actions";

export const metadata: Metadata = { title: "Biblioteca" };

function dominio(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function Biblioteca() {
  const { supabase, canEdit } = await getContext();
  const { data } = await supabase
    .from("materiais")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Material[]>();

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Biblioteca</h1>
          <p>Links e conteúdos que a Silvia compartilha</p>
        </div>
      </div>

      <details className="novo">
        <summary>Salvar material</summary>
        <form action={adicionarMaterial} className="card">
          <div className="field">
            <label htmlFor="titulo">Título</label>
            <input id="titulo" name="titulo" required />
          </div>
          <div className="field">
            <label htmlFor="url">Link</label>
            <input id="url" name="url" inputMode="url" placeholder="youtube.com/…" autoCapitalize="none" />
          </div>
          <div className="field">
            <label htmlFor="descricao">Nota</label>
            <textarea id="descricao" name="descricao" />
          </div>
          <button className="btn">Salvar</button>
        </form>
      </details>

      {data?.length ? (
        <div className="stack">
          {data.map((m) => (
            <article key={m.id} className="card">
              <div className="row between" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
                <div style={{ minWidth: 0 }}>
                  <h3>{m.titulo}</h3>
                  <p className="small muted">{fmtData(m.created_at.slice(0, 10), true)}{m.url ? ` · ${dominio(m.url)}` : ""}</p>
                </div>
                {m.url && (
                  <a className="btn btn-ghost btn-sm" href={m.url} target="_blank" rel="noopener noreferrer">Abrir</a>
                )}
              </div>
              {m.descricao && <div style={{ marginTop: 10 }}><Prose text={m.descricao} /></div>}
              {canEdit && (
                <form action={excluirMaterial} style={{ marginTop: 6 }}>
                  <input type="hidden" name="id" value={m.id} />
                  <button className="link-btn small" style={{ color: "var(--muted)" }}>Excluir</button>
                </form>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">Nada salvo ainda.</div>
      )}
    </>
  );
}

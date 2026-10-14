import type { Metadata } from "next";
import { getContext } from "@/lib/session";
import { fmtData, hoje } from "@/lib/format";
import FileUploader from "@/components/FileUploader";
import Prose from "@/components/Prose";
import type { Video } from "@/lib/types";
import { adicionarVideo, excluirVideo } from "./actions";

export const metadata: Metadata = { title: "Vídeos" };

export default async function Videos() {
  const { supabase, canEdit, user } = await getContext();
  const { data } = await supabase.from("videos").select("*").order("data", { ascending: false }).returns<Video[]>();

  const caminhos = (data ?? []).map((v) => v.arquivo_path).filter((p): p is string => !!p);
  const assinadas = new Map<string, string>();
  if (caminhos.length) {
    const { data: urls } = await supabase.storage.from("videos").createSignedUrls(caminhos, 3600);
    urls?.forEach((u) => u.path && u.signedUrl && assinadas.set(u.path, u.signedUrl));
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Vídeos do Ozzy</h1>
          <p>Para acompanhar a evolução</p>
        </div>
      </div>

      {canEdit && (
        <details className="novo">
          <summary>Adicionar vídeo</summary>
          <form action={adicionarVideo} className="card">
            <div className="field">
              <label htmlFor="titulo">Título</label>
              <input id="titulo" name="titulo" required />
            </div>
            <div className="field">
              <label htmlFor="data">Data</label>
              <input id="data" name="data" type="date" defaultValue={hoje()} />
            </div>
            <FileUploader bucket="videos" name="arquivo_path" accept="video/*" userId={user.id} label="Arquivo (até 50 MB)" maxMB={50} />
            <div className="field">
              <label htmlFor="url_externa">Ou link (YouTube, Drive…)</label>
              <input id="url_externa" name="url_externa" inputMode="url" autoCapitalize="none" />
            </div>
            <div className="field">
              <label htmlFor="descricao">Nota</label>
              <textarea id="descricao" name="descricao" />
            </div>
            <button className="btn">Salvar vídeo</button>
          </form>
        </details>
      )}

      {data?.length ? (
        <div className="video-grid">
          {data.map((v) => {
            const src = v.arquivo_path ? assinadas.get(v.arquivo_path) : undefined;
            return (
              <article key={v.id} className="card stack">
                {src ? (
                  <video controls preload="metadata" playsInline src={src} />
                ) : v.url_externa ? (
                  <a className="btn btn-ghost" href={v.url_externa} target="_blank" rel="noopener noreferrer">Abrir vídeo</a>
                ) : (
                  <p className="muted small">Vídeo indisponível.</p>
                )}
                <div>
                  <h3>{v.titulo}</h3>
                  <p className="small muted">{fmtData(v.data)}</p>
                </div>
                <Prose text={v.descricao} />
                {canEdit && (
                  <form action={excluirVideo}>
                    <input type="hidden" name="id" value={v.id} />
                    <button className="link-btn small" style={{ color: "var(--muted)", padding: 0 }}>Excluir</button>
                  </form>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty">Nenhum vídeo ainda.</div>
      )}
    </>
  );
}

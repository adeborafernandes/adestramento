import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContext } from "@/lib/session";
import { fmtData, fmtDataHora } from "@/lib/format";
import Prose from "@/components/Prose";
import StatusPill from "@/components/StatusPill";
import type { Aula, Comentario, Licao, Material, Profile } from "@/lib/types";
import AulaForm from "../AulaForm";
import { adicionarLicaoNaAula, apagarComentario, comentar, excluirAula, salvarAula } from "../actions";

export const metadata: Metadata = { title: "Aula" };

export default async function AulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, canEdit, user } = await getContext();

  const { data: aula } = await supabase.from("aulas").select("*").eq("id", id).maybeSingle<Aula>();
  if (!aula) notFound();

  const [licoes, materiais, comentarios, perfis] = await Promise.all([
    supabase.from("licoes").select("id,titulo,status").eq("aula_id", id).order("created_at").returns<Pick<Licao, "id" | "titulo" | "status">[]>(),
    supabase.from("materiais").select("id,titulo,url").eq("aula_id", id).returns<Pick<Material, "id" | "titulo" | "url">[]>(),
    supabase.from("comentarios").select("*").eq("aula_id", id).order("created_at").returns<Comentario[]>(),
    supabase.from("profiles").select("id,nome").returns<Pick<Profile, "id" | "nome">[]>(),
  ]);
  const nomes = new Map((perfis.data ?? []).map((p) => [p.id, p.nome ?? "Alguém"]));

  return (
    <div className="stack-lg">
      <div>
        <Link href="/aulas" className="small muted">← Aulas</Link>
        <div className="page-head" style={{ marginTop: 8, marginBottom: 0 }}>
          <div>
            <h1>{aula.titulo}</h1>
            <p>{fmtData(aula.data)}</p>
          </div>
        </div>
      </div>

      {aula.resumo && (
        <section>
          <h2 className="section-title" style={{ marginTop: 0 }}>Resumo</h2>
          <div className="card"><Prose text={aula.resumo} /></div>
        </section>
      )}
      {aula.anotacoes && (
        <section>
          <h2 className="section-title" style={{ marginTop: 0 }}>Anotações</h2>
          <div className="card"><Prose text={aula.anotacoes} /></div>
        </section>
      )}
      {aula.proximos_passos && (
        <section>
          <h2 className="section-title" style={{ marginTop: 0 }}>Próximos passos</h2>
          <div className="card"><Prose text={aula.proximos_passos} /></div>
        </section>
      )}

      <section>
        <h2 className="section-title" style={{ marginTop: 0 }}>Lição de casa desta aula</h2>
        {licoes.data?.length ? (
          <div className="stack">
            {licoes.data.map((l) => (
              <Link key={l.id} href="/licao" className="item-link row between">
                <span>{l.titulo}</span>
                <StatusPill status={l.status} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty">Sem lição cadastrada.</div>
        )}
        {canEdit && (
          <details className="novo" style={{ marginTop: 12 }}>
            <summary>Adicionar lição</summary>
            <form action={adicionarLicaoNaAula} className="card">
              <input type="hidden" name="aula_id" value={aula.id} />
              <input type="hidden" name="data" value={aula.data} />
              <div className="field">
                <label htmlFor="l-titulo">Lição</label>
                <input id="l-titulo" name="titulo" required />
              </div>
              <div className="field">
                <label htmlFor="l-desc">Detalhes</label>
                <textarea id="l-desc" name="descricao" />
              </div>
              <button className="btn">Adicionar</button>
            </form>
          </details>
        )}
      </section>

      {!!materiais.data?.length && (
        <section>
          <h2 className="section-title" style={{ marginTop: 0 }}>Materiais</h2>
          <div className="stack">
            {materiais.data.map((m) => (
              <a key={m.id} className="item-link" href={m.url ?? "/biblioteca"} target="_blank" rel="noopener noreferrer">{m.titulo}</a>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title" style={{ marginTop: 0 }}>Comentários</h2>
        <div className="stack">
          {comentarios.data?.map((c) => (
            <div key={c.id} className="card">
              <div className="row between small muted" style={{ marginBottom: 6 }}>
                <span>{(c.autor_id && nomes.get(c.autor_id)) || "Alguém"} · {fmtDataHora(c.created_at)}</span>
                {(canEdit || c.autor_id === user.id) && (
                  <form action={apagarComentario}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="aula_id" value={aula.id} />
                    <button className="link-btn" style={{ minHeight: 0, padding: 0, color: "var(--muted)" }}>Apagar</button>
                  </form>
                )}
              </div>
              <Prose text={c.texto} />
            </div>
          ))}
          <form action={comentar} className="card">
            <input type="hidden" name="aula_id" value={aula.id} />
            <div className="field">
              <label htmlFor="texto">Novo comentário</label>
              <textarea id="texto" name="texto" required />
            </div>
            <button className="btn btn-ghost">Comentar</button>
          </form>
        </div>
      </section>

      {canEdit && (
        <section className="stack">
          <details className="editar">
            <summary>Editar aula</summary>
            <div style={{ marginTop: 12 }}>
              <AulaForm action={salvarAula} aula={aula} rotulo="Salvar alterações" />
            </div>
          </details>
          <form action={excluirAula}>
            <input type="hidden" name="id" value={aula.id} />
            <button className="btn btn-danger btn-sm">Excluir aula</button>
          </form>
        </section>
      )}
    </div>
  );
}

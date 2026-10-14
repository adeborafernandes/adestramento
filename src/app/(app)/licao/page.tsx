import type { Metadata } from "next";
import { getContext } from "@/lib/session";
import { fmtData, hoje } from "@/lib/format";
import StatusPill, { ROTULO } from "@/components/StatusPill";
import Prose from "@/components/Prose";
import type { Licao, StatusLicao } from "@/lib/types";
import { atualizarLicao, criarLicao, excluirLicao } from "./actions";

export const metadata: Metadata = { title: "Lição de casa" };

const OPCOES: StatusLicao[] = ["feito", "parcial", "nao_feito"];

export default async function LicaoPage() {
  const { supabase, canEdit } = await getContext();
  const { data } = await supabase
    .from("licoes")
    .select("*")
    .order("semana", { ascending: false })
    .order("created_at", { ascending: true })
    .returns<Licao[]>();

  const semanas = new Map<string, Licao[]>();
  (data ?? []).forEach((l) => semanas.set(l.semana, [...(semanas.get(l.semana) ?? []), l]));

  const total = data?.length ?? 0;
  const feitas = data?.filter((l) => l.status === "feito").length ?? 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Lição de casa</h1>
          {total > 0 && <p>{feitas} de {total} concluídas</p>}
        </div>
      </div>

      {canEdit && (
        <details className="novo">
          <summary>Nova lição</summary>
          <form action={criarLicao} className="card">
            <div className="field">
              <label htmlFor="titulo">Lição</label>
              <input id="titulo" name="titulo" required />
            </div>
            <div className="field">
              <label htmlFor="descricao">Detalhes</label>
              <textarea id="descricao" name="descricao" />
            </div>
            <div className="field">
              <label htmlFor="data">Semana de</label>
              <input id="data" name="data" type="date" defaultValue={hoje()} />
            </div>
            <button className="btn">Adicionar</button>
          </form>
        </details>
      )}

      {semanas.size === 0 && <div className="empty">Nenhuma lição ainda. Elas aparecem aqui depois de cada aula.</div>}

      {[...semanas.entries()].map(([semana, itens]) => (
        <section key={semana}>
          <h2 className="section-title">Semana de {fmtData(semana, true)}</h2>
          <div className="stack">
            {itens.map((l) => (
              <article key={l.id} className="card">
                <div className="row between" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                  <h3>{l.titulo}</h3>
                  <StatusPill status={l.status} />
                </div>
                {l.descricao && <div style={{ marginTop: 8 }}><Prose text={l.descricao} /></div>}

                {canEdit ? (
                  <form action={atualizarLicao} style={{ marginTop: 14 }}>
                    <input type="hidden" name="id" value={l.id} />
                    <div className="seg" role="radiogroup" aria-label="Como foi">
                      {OPCOES.map((o) => (
                        <span key={o} style={{ display: "contents" }}>
                          <input type="radio" id={`${l.id}-${o}`} name="status" value={o} defaultChecked={l.status === o} />
                          <label htmlFor={`${l.id}-${o}`}>{ROTULO[o]}</label>
                        </span>
                      ))}
                    </div>
                    <div className="field" style={{ marginTop: 12 }}>
                      <label htmlFor={`${l.id}-obs`}>Observações</label>
                      <textarea id={`${l.id}-obs`} name="observacao" defaultValue={l.observacao ?? ""} placeholder="Como o Ozzy reagiu? O que ajudou?" />
                    </div>
                    <button className="btn btn-sm">Salvar</button>
                  </form>
                ) : (
                  l.observacao && <div style={{ marginTop: 10 }}><p className="small muted">Observações</p><Prose text={l.observacao} /></div>
                )}

                {canEdit && (
                  <form action={excluirLicao} style={{ marginTop: 8 }}>
                    <input type="hidden" name="id" value={l.id} />
                    <button className="link-btn small" style={{ color: "var(--muted)" }}>Excluir lição</button>
                  </form>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

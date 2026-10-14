import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContext } from "@/lib/session";
import { diasAte, fmtData, hoje } from "@/lib/format";
import FileUploader from "@/components/FileUploader";
import Prose from "@/components/Prose";
import type { Consulta, Exame, Medicamento } from "@/lib/types";
import {
  adicionarConsulta, adicionarExame, adicionarMedicamento, encerrarMedicamento, excluirRegistro,
} from "./actions";

export const metadata: Metadata = { title: "Saúde" };

const ABAS = [
  { id: "resumo", nome: "Resumo" },
  { id: "consultas", nome: "Consultas" },
  { id: "exames", nome: "Exames" },
  { id: "medicamentos", nome: "Medicamentos" },
] as const;

function Excluir({ tabela, id }: { tabela: string; id: string }) {
  return (
    <form action={excluirRegistro}>
      <input type="hidden" name="tabela" value={tabela} />
      <input type="hidden" name="id" value={id} />
      <button className="link-btn small" style={{ color: "var(--muted)", padding: 0 }}>Excluir</button>
    </form>
  );
}

function Linha({ k, v }: { k: string; v: string | null | undefined }) {
  if (!v) return null;
  return (<><dt>{k}</dt><dd>{v}</dd></>);
}

const ativo = (m: Medicamento) => !m.fim || m.fim >= hoje();

export default async function Saude({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { canEdit, supabase, user } = await getContext();
  if (!canEdit) notFound();
  const { aba: abaParam } = await searchParams;
  const aba = ABAS.some((a) => a.id === abaParam) ? abaParam! : "resumo";

  const [c, e, m] = await Promise.all([
    supabase.from("consultas").select("*").order("data", { ascending: false }).returns<Consulta[]>(),
    supabase.from("exames").select("*").order("data", { ascending: false }).returns<Exame[]>(),
    supabase.from("medicamentos").select("*").order("created_at", { ascending: false }).returns<Medicamento[]>(),
  ]);
  const consultas = c.data ?? [];
  const exames = e.data ?? [];
  const meds = m.data ?? [];

  const assinadas = new Map<string, string>();
  const paths = exames.map((x) => x.arquivo_path).filter((p): p is string => !!p);
  if (paths.length) {
    const { data } = await supabase.storage.from("clinico").createSignedUrls(paths, 3600);
    data?.forEach((u) => u.path && u.signedUrl && assinadas.set(u.path, u.signedUrl));
  }

  const continuos = meds.filter((x) => x.uso_continuo && ativo(x));
  const retornos = consultas
    .filter((x) => x.retorno_em && x.retorno_em >= hoje())
    .sort((a, b) => a.retorno_em!.localeCompare(b.retorno_em!));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Saúde do Ozzy</h1>
          <p>Visível apenas para a família</p>
        </div>
      </div>

      <nav className="sub-tabs" aria-label="Seções da saúde">
        {ABAS.map((a) => (
          <Link key={a.id} href={`/saude?aba=${a.id}`} aria-current={aba === a.id ? "page" : undefined}>{a.nome}</Link>
        ))}
      </nav>

      {aba === "resumo" && (
        <div className="stack-lg">
          <section>
            <h2 style={{ marginBottom: 12 }}>Uso contínuo</h2>
            {continuos.length ? (
              <div className="stack">
                {continuos.map((x) => (
                  <div key={x.id} className="card">
                    <h3>{x.nome}</h3>
                    <p className="muted small">{[x.dose, x.frequencia].filter(Boolean).join(" · ")}</p>
                  </div>
                ))}
              </div>
            ) : <div className="empty">Nenhum medicamento de uso contínuo.</div>}
          </section>

          <section>
            <h2 style={{ marginBottom: 12 }}>Próximos retornos</h2>
            {retornos.length ? (
              <div className="stack">
                {retornos.map((x) => {
                  const d = diasAte(x.retorno_em!);
                  return (
                    <div key={x.id} className="card row between">
                      <div>
                        <h3>{fmtData(x.retorno_em)}</h3>
                        <p className="muted small">{[x.tipo, x.veterinario].filter(Boolean).join(" · ")}</p>
                      </div>
                      <span className={`pill ${d <= 7 ? "pill-warn" : "pill-info"}`}>{d === 0 ? "Hoje" : d === 1 ? "Amanhã" : `em ${d} dias`}</span>
                    </div>
                  );
                })}
              </div>
            ) : <div className="empty">Nenhum retorno marcado.</div>}
          </section>

          <section>
            <h2 style={{ marginBottom: 12 }}>Última consulta</h2>
            {consultas[0] ? (
              <div className="card">
                <h3>{consultas[0].tipo} · {fmtData(consultas[0].data)}</h3>
                <p className="muted small">{[consultas[0].veterinario, consultas[0].clinica].filter(Boolean).join(" · ")}</p>
                {consultas[0].motivo && <p style={{ marginTop: 8 }}>{consultas[0].motivo}</p>}
              </div>
            ) : <div className="empty">Nenhuma consulta registrada.</div>}
          </section>
        </div>
      )}

      {aba === "consultas" && (
        <>
          <details className="novo">
            <summary>Registrar consulta</summary>
            <form action={adicionarConsulta} className="card">
              <div className="grid2">
                <div className="field"><label htmlFor="c-data">Data</label><input id="c-data" name="data" type="date" defaultValue={hoje()} required /></div>
                <div className="field"><label htmlFor="c-tipo">Tipo</label><input id="c-tipo" name="tipo" defaultValue="Consulta" placeholder="Rotina, vacina, retorno…" /></div>
                <div className="field"><label htmlFor="c-vet">Veterinário(a)</label><input id="c-vet" name="veterinario" /></div>
                <div className="field"><label htmlFor="c-cli">Clínica</label><input id="c-cli" name="clinica" /></div>
              </div>
              <div className="field"><label htmlFor="c-mot">Motivo</label><input id="c-mot" name="motivo" /></div>
              <div className="field"><label htmlFor="c-obs">Observações</label><textarea id="c-obs" name="observacoes" /></div>
              <div className="field"><label htmlFor="c-ret">Retorno em</label><input id="c-ret" name="retorno_em" type="date" /></div>
              <button className="btn">Salvar consulta</button>
            </form>
          </details>
          {consultas.length ? (
            <div className="stack">
              {consultas.map((x) => (
                <article key={x.id} className="card">
                  <h3>{x.tipo} · {fmtData(x.data)}</h3>
                  <dl className="kv" style={{ marginTop: 10 }}>
                    <Linha k="Veterinário" v={x.veterinario} />
                    <Linha k="Clínica" v={x.clinica} />
                    <Linha k="Motivo" v={x.motivo} />
                    <Linha k="Retorno" v={x.retorno_em ? fmtData(x.retorno_em) : null} />
                  </dl>
                  <Prose text={x.observacoes} />
                  <div style={{ marginTop: 8 }}><Excluir tabela="consultas" id={x.id} /></div>
                </article>
              ))}
            </div>
          ) : <div className="empty">Nenhuma consulta registrada.</div>}
        </>
      )}

      {aba === "exames" && (
        <>
          <details className="novo">
            <summary>Registrar exame</summary>
            <form action={adicionarExame} className="card">
              <div className="grid2">
                <div className="field"><label htmlFor="e-nome">Exame</label><input id="e-nome" name="nome" required placeholder="Hemograma, raio-x…" /></div>
                <div className="field"><label htmlFor="e-data">Data</label><input id="e-data" name="data" type="date" defaultValue={hoje()} required /></div>
              </div>
              <div className="field"><label htmlFor="e-lab">Laboratório / clínica</label><input id="e-lab" name="laboratorio" /></div>
              <div className="field"><label htmlFor="e-res">Resultado</label><textarea id="e-res" name="resultado" /></div>
              <FileUploader bucket="clinico" name="arquivo_path" accept="application/pdf,image/*" userId={user.id} label="Laudo (PDF ou foto, até 20 MB)" maxMB={20} />
              <div className="field"><label htmlFor="e-obs">Observações</label><textarea id="e-obs" name="observacoes" /></div>
              <button className="btn">Salvar exame</button>
            </form>
          </details>
          {exames.length ? (
            <div className="stack">
              {exames.map((x) => {
                const url = x.arquivo_path ? assinadas.get(x.arquivo_path) : undefined;
                return (
                  <article key={x.id} className="card">
                    <div className="row between" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
                      <div><h3>{x.nome}</h3><p className="small muted">{fmtData(x.data)}{x.laboratorio ? ` · ${x.laboratorio}` : ""}</p></div>
                      {url && <a className="btn btn-ghost btn-sm" href={url} target="_blank" rel="noopener noreferrer">Ver laudo</a>}
                    </div>
                    {x.resultado && <div style={{ marginTop: 10 }}><Prose text={x.resultado} /></div>}
                    {x.observacoes && <div style={{ marginTop: 10 }}><Prose text={x.observacoes} /></div>}
                    <div style={{ marginTop: 8 }}><Excluir tabela="exames" id={x.id} /></div>
                  </article>
                );
              })}
            </div>
          ) : <div className="empty">Nenhum exame registrado.</div>}
        </>
      )}

      {aba === "medicamentos" && (
        <>
          <details className="novo">
            <summary>Adicionar medicamento</summary>
            <form action={adicionarMedicamento} className="card">
              <div className="field"><label htmlFor="m-nome">Medicamento</label><input id="m-nome" name="nome" required /></div>
              <div className="grid2">
                <div className="field"><label htmlFor="m-dose">Dose</label><input id="m-dose" name="dose" placeholder="Ex.: 1 comprimido" /></div>
                <div className="field"><label htmlFor="m-freq">Frequência</label><input id="m-freq" name="frequencia" placeholder="Ex.: 2x ao dia" /></div>
                <div className="field"><label htmlFor="m-ini">Início</label><input id="m-ini" name="inicio" type="date" /></div>
                <div className="field"><label htmlFor="m-fim">Fim (se houver)</label><input id="m-fim" name="fim" type="date" /></div>
              </div>
              <div className="field"><label htmlFor="m-mot">Para quê</label><input id="m-mot" name="motivo" /></div>
              <div className="field"><label className="check"><input type="checkbox" name="uso_continuo" defaultChecked /> Uso contínuo</label></div>
              <div className="field"><label htmlFor="m-obs">Observações</label><textarea id="m-obs" name="observacoes" /></div>
              <button className="btn">Salvar medicamento</button>
            </form>
          </details>
          {meds.length ? (
            <div className="stack">
              {meds.map((x) => (
                <article key={x.id} className="card">
                  <div className="row between" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
                    <h3>{x.nome}</h3>
                    <span className={`pill ${ativo(x) ? "pill-ok" : "pill-pendente"}`}>
                      {ativo(x) ? (x.uso_continuo ? "Uso contínuo" : "Em uso") : "Encerrado"}
                    </span>
                  </div>
                  <dl className="kv" style={{ marginTop: 10 }}>
                    <Linha k="Dose" v={x.dose} />
                    <Linha k="Frequência" v={x.frequencia} />
                    <Linha k="Para quê" v={x.motivo} />
                    <Linha k="Início" v={x.inicio ? fmtData(x.inicio) : null} />
                    <Linha k="Fim" v={x.fim ? fmtData(x.fim) : null} />
                  </dl>
                  <Prose text={x.observacoes} />
                  <div className="row" style={{ marginTop: 8 }}>
                    {ativo(x) && (
                      <form action={encerrarMedicamento}>
                        <input type="hidden" name="id" value={x.id} />
                        <button className="btn btn-ghost btn-sm">Encerrar uso</button>
                      </form>
                    )}
                    <Excluir tabela="medicamentos" id={x.id} />
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="empty">Nenhum medicamento registrado.</div>}
        </>
      )}
    </>
  );
}

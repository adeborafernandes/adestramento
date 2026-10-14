import type { Aula } from "@/lib/types";
import { hoje } from "@/lib/format";

export default function AulaForm({
  action, aula, rotulo,
}: {
  action: (fd: FormData) => void | Promise<void>;
  aula?: Aula;
  rotulo: string;
}) {
  return (
    <form action={action} className="card">
      {aula && <input type="hidden" name="id" value={aula.id} />}
      <div className="grid2">
        <div className="field">
          <label htmlFor="titulo">Título</label>
          <input id="titulo" name="titulo" required defaultValue={aula?.titulo} placeholder="Ex.: Aula 2 — mastigáveis" />
        </div>
        <div className="field">
          <label htmlFor="data">Data</label>
          <input id="data" name="data" type="date" required defaultValue={aula?.data ?? hoje()} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="resumo">Resumo</label>
        <textarea id="resumo" name="resumo" defaultValue={aula?.resumo ?? ""} />
      </div>
      <div className="field">
        <label htmlFor="anotacoes">Anotações</label>
        <textarea id="anotacoes" name="anotacoes" rows={8} defaultValue={aula?.anotacoes ?? ""} />
        <p className="small muted" style={{ marginTop: 6 }}>Use “- ” no começo da linha para fazer listas.</p>
      </div>
      <div className="field">
        <label htmlFor="proximos_passos">Próximos passos</label>
        <textarea id="proximos_passos" name="proximos_passos" defaultValue={aula?.proximos_passos ?? ""} />
      </div>
      <button className="btn">{rotulo}</button>
    </form>
  );
}

import type { Metadata } from "next";
import { getContext } from "@/lib/session";
import { liberarEmail, removerEmail } from "./actions";

export const metadata: Metadata = { title: "Conta" };

const PAPEL: Record<string, string> = {
  admin: "Administradora",
  editor: "Edita tudo",
  comentarista: "Vê e comenta",
};

export default async function Acesso() {
  const { supabase, profile, isAdmin } = await getContext();
  const { data: lista } = isAdmin
    ? await supabase.from("allowed_emails").select("email,papel").order("created_at")
    : { data: null };

  return (
    <div className="stack-lg">
      <div className="page-head" style={{ marginBottom: 0 }}>
        <div><h1>Conta</h1></div>
      </div>

      <div className="card row between">
        <div>
          <h3>{profile.nome ?? profile.email}</h3>
          <p className="small muted">{profile.email} · {PAPEL[profile.papel]}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="btn btn-ghost">Sair</button>
        </form>
      </div>

      {isAdmin && (
        <section>
          <h2 style={{ marginBottom: 12 }}>Quem tem acesso</h2>
          <div className="stack">
            {lista?.map((p) => (
              <div key={p.email} className="card row between">
                <div style={{ minWidth: 0 }}>
                  <p style={{ overflowWrap: "anywhere" }}>{p.email}</p>
                  <p className="small muted">{PAPEL[p.papel]}</p>
                </div>
                {p.email !== profile.email && (
                  <form action={removerEmail}>
                    <input type="hidden" name="email" value={p.email} />
                    <button className="btn btn-danger btn-sm">Remover</button>
                  </form>
                )}
              </div>
            ))}
          </div>

          <details className="novo" style={{ marginTop: 16 }}>
            <summary>Liberar novo acesso</summary>
            <form action={liberarEmail} className="card">
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input id="email" name="email" type="email" required inputMode="email" autoCapitalize="none" />
              </div>
              <div className="field">
                <label htmlFor="papel">Permissão</label>
                <select id="papel" name="papel" defaultValue="editor">
                  <option value="editor">Edita tudo (inclui saúde)</option>
                  <option value="comentarista">Vê e comenta (sem saúde) — para a Silvia</option>
                  <option value="admin">Administradora</option>
                </select>
              </div>
              <button className="btn">Liberar</button>
            </form>
          </details>
        </section>
      )}
    </div>
  );
}

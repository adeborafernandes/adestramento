"use client";

import { useActionState, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { entrar, criarConta, recuperar, type Estado } from "./actions";

type Modo = "entrar" | "criar" | "recuperar";
const inicial: Estado = {};

function Google() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.5 12.27c0-.8-.07-1.56-.2-2.3H12v4.35h5.9a5.05 5.05 0 0 1-2.19 3.31v2.75h3.54c2.07-1.9 3.25-4.72 3.25-8.11z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.67l-3.54-2.75c-.98.66-2.24 1.05-3.74 1.05-2.87 0-5.3-1.94-6.17-4.55H2.17v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.83 14.08a6.6 6.6 0 0 1 0-4.16V7.08H2.17a11 11 0 0 0 0 9.84l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.37c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.17 7.08l3.66 2.84C6.7 7.31 9.13 5.37 12 5.37z" />
    </svg>
  );
}

export default function LoginForm({ erroInicial }: { erroInicial?: string }) {
  const [modo, setModo] = useState<Modo>("entrar");
  const [sEntrar, aEntrar, pEntrar] = useActionState(entrar, inicial);
  const [sCriar, aCriar, pCriar] = useActionState(criarConta, inicial);
  const [sRec, aRec, pRec] = useActionState(recuperar, inicial);
  const [erroGoogle, setErroGoogle] = useState<string>();

  const estado = modo === "entrar" ? sEntrar : modo === "criar" ? sCriar : sRec;
  const acao = modo === "entrar" ? aEntrar : modo === "criar" ? aCriar : aRec;
  const pendente = pEntrar || pCriar || pRec;
  const erro = estado.erro ?? erroGoogle ?? erroInicial;

  async function google() {
    setErroGoogle(undefined);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setErroGoogle("Não foi possível entrar com o Google.");
  }

  const titulo = modo === "entrar" ? "Entrar" : modo === "criar" ? "Criar conta" : "Nova senha";

  return (
    <>
      <h1>{titulo}</h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        {modo === "recuperar"
          ? "Informe seu e-mail para receber o link."
          : "Acesso restrito à família e à Silvia."}
      </p>

      {modo !== "recuperar" && (
        <>
          <button type="button" className="btn btn-ghost btn-block google-btn" onClick={google}>
            <Google /> Continuar com Google
          </button>
          <div className="divider">ou</div>
        </>
      )}

      <form action={acao} key={modo}>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="email" required inputMode="email" />
        </div>
        {modo !== "recuperar" && (
          <div className="field">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha" name="senha" type="password" required minLength={modo === "criar" ? 8 : undefined}
              autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            />
          </div>
        )}
        {erro && <div className="alert alert-bad" role="alert" style={{ marginBottom: 14 }}>{erro}</div>}
        {estado.ok && <div className="alert alert-ok" role="status" style={{ marginBottom: 14 }}>{estado.ok}</div>}
        <button className="btn btn-block" disabled={pendente}>
          {pendente ? "Aguarde…" : modo === "entrar" ? "Entrar" : modo === "criar" ? "Criar conta" : "Enviar link"}
        </button>
      </form>

      <div className="stack" style={{ marginTop: 12, alignItems: "flex-start", gap: 0 }}>
        {modo === "entrar" && (
          <>
            <button className="link-btn" onClick={() => setModo("recuperar")}>Esqueci a senha</button>
            <button className="link-btn" onClick={() => setModo("criar")}>Primeiro acesso? Criar conta</button>
          </>
        )}
        {modo !== "entrar" && (
          <button className="link-btn" onClick={() => setModo("entrar")}>Voltar para entrar</button>
        )}
      </div>
    </>
  );
}

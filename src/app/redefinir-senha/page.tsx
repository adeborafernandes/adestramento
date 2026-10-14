import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { str } from "@/lib/form";

export const metadata: Metadata = { title: "Nova senha" };

async function salvar(fd: FormData) {
  "use server";
  const senha = str(fd, "senha");
  if (senha.length < 8) redirect("/redefinir-senha?erro=curta");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) redirect("/redefinir-senha?erro=falha");
  redirect("/aulas");
}

export default async function RedefinirSenha({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <main className="auth-wrap">
      <form action={salvar} className="card auth-card">
        <h1 style={{ marginBottom: 20 }}>Criar nova senha</h1>
        <div className="field">
          <label htmlFor="senha">Nova senha</label>
          <input id="senha" name="senha" type="password" minLength={8} required autoComplete="new-password" />
        </div>
        {erro && (
          <div className="alert alert-bad" role="alert" style={{ marginBottom: 14 }}>
            {erro === "curta" ? "A senha precisa ter pelo menos 8 caracteres." : "Não foi possível salvar. Peça um novo link."}
          </div>
        )}
        <button className="btn btn-block">Salvar senha</button>
      </form>
    </main>
  );
}

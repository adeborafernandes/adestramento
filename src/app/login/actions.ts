"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { str } from "@/lib/form";

export type Estado = { erro?: string; ok?: string };

async function origem() {
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("host")}`;
}

function traduz(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("sem acesso") || m.includes("database error"))
    return "Este e-mail ainda não tem acesso. Peça para ser adicionado.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail pelo link que enviamos.";
  if (m.includes("already registered")) return "Este e-mail já tem conta. Use Entrar.";
  if (m.includes("password")) return "A senha precisa ter pelo menos 8 caracteres.";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde alguns minutos.";
  return "Não foi possível concluir. Tente novamente.";
}

export async function entrar(_: Estado, fd: FormData): Promise<Estado> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: str(fd, "email").toLowerCase(),
    password: str(fd, "senha"),
  });
  if (error) return { erro: traduz(error.message) };
  redirect("/aulas");
}

export async function criarConta(_: Estado, fd: FormData): Promise<Estado> {
  const senha = str(fd, "senha");
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: str(fd, "email").toLowerCase(),
    password: senha,
    options: { emailRedirectTo: `${await origem()}/auth/callback` },
  });
  if (error) return { erro: traduz(error.message) };
  if (data.session) redirect("/aulas");
  return { ok: "Enviamos um link de confirmação para o seu e-mail." };
}

export async function recuperar(_: Estado, fd: FormData): Promise<Estado> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(str(fd, "email").toLowerCase(), {
    redirectTo: `${await origem()}/auth/callback?next=/redefinir-senha`,
  });
  if (error) return { erro: traduz(error.message) };
  return { ok: "Se o e-mail tiver acesso, você vai receber um link para criar uma nova senha." };
}

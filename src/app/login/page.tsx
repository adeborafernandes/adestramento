import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default async function Login({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <div className="auth-wrap">
      <aside className="auth-hero">
        <div className="logo" aria-hidden="true">
          <svg viewBox="0 0 64 64"><g fill="#c4177a"><ellipse cx="20" cy="26" rx="6" ry="8" /><ellipse cx="44" cy="26" rx="6" ry="8" /><ellipse cx="32" cy="18" rx="5.5" ry="7.5" /><path d="M32 30c-9 0-15 7-15 13 0 5 4 8 9 8 3 0 4-1 6-1s3 1 6 1c5 0 9-3 9-8 0-6-6-13-15-13z" /></g></svg>
        </div>
        <h2>Caderno do <span>Ozzy</span></h2>
        <p>Aulas, lição de casa, vídeos e saúde em um só lugar.</p>
      </aside>
      <main className="auth-main">
        <div className="card auth-card">
          <LoginForm erroInicial={erro} />
        </div>
      </main>
    </div>
  );
}

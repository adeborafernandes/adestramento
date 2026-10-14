import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default async function Login({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <main className="auth-wrap">
      <div className="card auth-card">
        <p className="brand" style={{ marginBottom: 20 }}>Caderno do <span>Ozzy</span></p>
        <LoginForm erroInicial={erro} />
      </div>
    </main>
  );
}

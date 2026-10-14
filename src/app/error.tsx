"use client";

export default function Erro({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="auth-wrap">
      <div className="card auth-card stack">
        <h1>Algo não saiu como esperado</h1>
        <p className="muted">{error.message || "Tente novamente em instantes."}</p>
        <div className="row">
          <button className="btn" onClick={reset}>Tentar de novo</button>
          <form action="/auth/signout" method="post">
            <button className="btn btn-ghost" type="submit">Sair</button>
          </form>
        </div>
      </div>
    </div>
  );
}

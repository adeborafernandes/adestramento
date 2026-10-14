import type { Metadata } from "next";
import Link from "next/link";
import { getContext } from "@/lib/session";
import { fmtData } from "@/lib/format";
import type { Aula } from "@/lib/types";

export const metadata: Metadata = { title: "Aulas" };

export default async function Aulas() {
  const { supabase, canEdit } = await getContext();
  const { data } = await supabase
    .from("aulas")
    .select("id,data,titulo,resumo")
    .order("data", { ascending: false })
    .returns<Pick<Aula, "id" | "data" | "titulo" | "resumo">[]>();

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Aulas</h1>
          <p>Segundas-feiras com a Silvia</p>
        </div>
        {canEdit && <Link href="/aulas/nova" className="btn">Nova aula</Link>}
      </div>

      {data?.length ? (
        <div className="stack">
          {data.map((a) => (
            <Link key={a.id} href={`/aulas/${a.id}`} className="item-link">
              <p className="small">{fmtData(a.data)}</p>
              <h3>{a.titulo}</h3>
              {a.resumo && <p>{a.resumo.length > 160 ? a.resumo.slice(0, 160) + "…" : a.resumo}</p>}
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty">Nenhuma aula registrada ainda.</div>
      )}
    </>
  );
}

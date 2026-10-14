import type { Metadata } from "next";
import { requireEditor } from "@/lib/session";
import AulaForm from "../AulaForm";
import { criarAula } from "../actions";

export const metadata: Metadata = { title: "Nova aula" };

export default async function NovaAula() {
  await requireEditor();
  return (
    <>
      <div className="page-head"><h1>Nova aula</h1></div>
      <AulaForm action={criarAula} rotulo="Salvar aula" />
    </>
  );
}

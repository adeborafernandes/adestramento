import type { StatusLicao } from "@/lib/types";

export const ROTULO: Record<StatusLicao, string> = {
  pendente: "Pendente",
  feito: "Feito",
  parcial: "Em parte",
  nao_feito: "Não fiz",
};

export default function StatusPill({ status }: { status: StatusLicao }) {
  return <span className={`pill pill-${status}`}>{ROTULO[status]}</span>;
}

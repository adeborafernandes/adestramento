export type Papel = "admin" | "editor" | "comentarista";
export type StatusLicao = "pendente" | "feito" | "parcial" | "nao_feito";

export type Profile = { id: string; email: string; nome: string | null; papel: Papel };
export type Aula = {
  id: string; data: string; titulo: string;
  resumo: string | null; anotacoes: string | null; proximos_passos: string | null;
};
export type Licao = {
  id: string; aula_id: string | null; semana: string; titulo: string;
  descricao: string | null; status: StatusLicao; observacao: string | null;
};
export type Material = {
  id: string; titulo: string; url: string | null; descricao: string | null;
  aula_id: string | null; created_at: string;
};
export type Comentario = {
  id: string; aula_id: string; autor_id: string | null; texto: string; created_at: string;
};
export type Video = {
  id: string; titulo: string; descricao: string | null; data: string;
  arquivo_path: string | null; url_externa: string | null;
};
export type Consulta = {
  id: string; data: string; tipo: string; veterinario: string | null; clinica: string | null;
  motivo: string | null; observacoes: string | null; retorno_em: string | null;
};
export type Exame = {
  id: string; data: string; nome: string; laboratorio: string | null;
  resultado: string | null; observacoes: string | null; arquivo_path: string | null;
};
export type Medicamento = {
  id: string; nome: string; dose: string | null; frequencia: string | null; motivo: string | null;
  inicio: string | null; fim: string | null; uso_continuo: boolean; observacoes: string | null;
};

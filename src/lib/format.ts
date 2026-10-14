const parse = (d: string) => new Date(d.length <= 10 ? `${d}T00:00:00Z` : d);

export function fmtData(d: string | null | undefined, curta = false) {
  if (!d) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: curta ? "short" : "long",
    year: curta ? undefined : "numeric",
    timeZone: "UTC",
  }).format(parse(d));
}

export function fmtDataHora(d: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(d));
}

/** Segunda-feira da semana de uma data (YYYY-MM-DD). */
export function segundaDe(d: string) {
  const dt = parse(d);
  const dia = (dt.getUTCDay() + 6) % 7;
  dt.setUTCDate(dt.getUTCDate() - dia);
  return dt.toISOString().slice(0, 10);
}

export const hoje = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());

export function diasAte(d: string) {
  const a = parse(hoje()).getTime();
  const b = parse(d).getTime();
  return Math.round((b - a) / 86400000);
}

export function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}
export function opt(fd: FormData, key: string) {
  const v = str(fd, key);
  return v === "" ? null : v;
}
export function ensure(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}
/** Aceita só http(s) para links. */
export function urlSegura(v: string | null) {
  if (!v) return null;
  const u = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    return new URL(u).toString();
  } catch {
    return null;
  }
}

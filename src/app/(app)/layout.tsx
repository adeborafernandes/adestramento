import Link from "next/link";
import { getContext } from "@/lib/session";
import Nav, { type NavItem } from "@/components/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { canEdit, profile } = await getContext();

  const items: NavItem[] = [
    { href: "/aulas", label: "Aulas", icon: "aulas" },
    { href: "/licao", label: "Lição", icon: "licao" },
    { href: "/biblioteca", label: "Biblioteca", icon: "biblioteca" },
    { href: "/videos", label: "Vídeos", icon: "videos" },
    ...(canEdit ? [{ href: "/saude", label: "Saúde", icon: "saude" }] : []),
  ];

  return (
    <>
      <header className="topbar">
        <div className="topbar-in">
          <Link href="/aulas" className="brand">Caderno do <span>Ozzy</span></Link>
          <Nav items={items} variant="top" />
          <Link href="/acesso" className="conta-link">{profile.nome?.split(" ")[0] ?? "Conta"}</Link>
        </div>
      </header>
      <main className="page">{children}</main>
      <Nav items={items} variant="tabs" />
    </>
  );
}

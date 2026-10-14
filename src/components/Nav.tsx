"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; icon: string };

const ICONS: Record<string, React.ReactNode> = {
  aulas: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16zM4 21.5A2.5 2.5 0 0 1 6.5 19H20M8 7h8" />,
  licao: <path d="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9" />,
  biblioteca: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  videos: <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h9A2.5 2.5 0 0 1 17 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 3 17.5v-11zM17 10l4-2.5v9L17 14" />,
  saude: <path d="M12 21s-7-4.5-9-9.2C1.8 8.6 3.7 5 7 5c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.3 0 5.2 3.600 4 6.800C19 16.500 12 21 12 21zM12 10v5M9.500 12.500h5" />,
};

export default function Nav({ items, variant }: { items: NavItem[]; variant: "top" | "tabs" }) {
  const path = usePathname();
  const ativo = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <nav className={variant === "top" ? "nav-desktop" : "tabs"} aria-label="Principal">
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={ativo(i.href) ? "page" : undefined}>
          {variant === "tabs" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {ICONS[i.icon]}
            </svg>
          )}
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

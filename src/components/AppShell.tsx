"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  PiggyBank,
  PieChart,
  Wallet,
} from "lucide-react";

const LINKS = [
  { href: "/", label: "Visão do mês", icon: LayoutDashboard },
  { href: "/contas-fixas", label: "Contas fixas", icon: Landmark },
  { href: "/gastos", label: "Gastos", icon: ArrowDownLeft },
  { href: "/receitas", label: "Receitas", icon: ArrowUpRight },
  { href: "/parcelas", label: "Parcelas", icon: CreditCard },
  { href: "/metas", label: "Metas", icon: PiggyBank },
  { href: "/relatorios", label: "Relatórios", icon: PieChart },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-full ledger-grid">
      <div className="mx-auto flex min-h-full max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-card/90 px-5 py-6 backdrop-blur md:flex">
          <Link href="/" className="mb-8 block">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
              projeto_particular
            </p>
            <p className="font-display mt-1 text-2xl leading-none text-ink">
              Controle financeiro
            </p>
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-pine text-white"
                      : "text-muted hover:bg-paper hover:text-ink"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <p className="mt-6 text-xs leading-5 text-muted">
            Caderno pessoal de contas, receitas e o que sobra no fim do mês.
          </p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-line bg-paper/90 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur md:hidden">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-pine" />
              <span className="font-display text-lg">projeto_particular</span>
            </div>
            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
              {LINKS.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`min-h-10 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold ${
                      active ? "bg-pine text-white" : "bg-card text-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { MonthNav } from "@/components/MonthNav";
import { Card, EmptyState, Money, PageHeader, StatusPill } from "@/components/ui";
import { MONTH_NAMES, parseYearMonth } from "@/lib/dates";
import { getMonthSnapshot } from "@/lib/queries";
import { spendingRatio } from "@/lib/summary";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Landmark, PiggyBank } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const { year, month } = parseYearMonth(await searchParams);
  const snapshot = await getMonthSnapshot(year, month);
  const ratio = spendingRatio(snapshot.totals.receitas, snapshot.totals.saidas);
  const overdue = snapshot.bills.filter((bill) => bill.status === "atrasado");
  const pending = snapshot.bills.filter((bill) => bill.status !== "pago");

  return (
    <div>
      <PageHeader
        eyebrow="projeto_particular"
        title={`Resumo de ${MONTH_NAMES[month - 1]}`}
        description="Acompanhe contas fixas, gastos do dia a dia, o que entrou e o que ainda pode sobrar."
        action={<MonthNav year={year} month={month} pathname="/" />}
      />

      {overdue.length > 0 ? (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose/20 bg-rose/5 px-4 py-3 text-sm text-rose">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>
            {overdue.length === 1
              ? `Há 1 conta atrasada: ${overdue[0].name}.`
              : `Há ${overdue.length} contas atrasadas neste mês.`}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={<ArrowUpRight size={18} />}
          label="Receitas"
          cents={snapshot.totals.receitas}
          hint="Tudo que entrou no mês"
        />
        <Stat
          icon={<Landmark size={18} />}
          label="Contas fixas"
          cents={snapshot.totals.fixas}
          hint={`${snapshot.bills.filter((bill) => bill.status === "pago").length}/${snapshot.bills.length} pagas`}
        />
        <Stat
          icon={<ArrowDownLeft size={18} />}
          label="Gastos e parcelas"
          cents={snapshot.totals.gastos + snapshot.totals.parcelas}
          hint={`${snapshot.expenses.length} gastos · ${snapshot.installments.length} parcelas`}
        />
        <Stat
          icon={<PiggyBank size={18} />}
          label="Saldo do mês"
          cents={snapshot.totals.saldo}
          hint="Receitas menos todas as saídas"
          signed
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Uso da receita</h2>
            <Money cents={snapshot.totals.livreAposFixas} className="text-sm text-muted" />
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-paper">
            <div
              className={`h-full rounded-full ${ratio > 0.9 ? "bg-rose" : ratio > 0.7 ? "bg-warn" : "bg-pine"}`}
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-muted">
            {snapshot.totals.receitas === 0
              ? "Lance as receitas do mês para ver quanto da entrada já foi comprometida."
              : `${Math.round(ratio * 100)}% da receita já saiu. Depois das contas fixas, restam ${formatHint(snapshot.totals.livreAposFixas)} para o restante.`}
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-2xl">Atalhos</h2>
          <div className="mt-4 grid gap-2">
            <QuickLink href="/contas-fixas" label="Cadastrar conta fixa" />
            <QuickLink href="/gastos" label="Registrar gasto" />
            <QuickLink href="/receitas" label="Lançar receita" />
            <QuickLink href="/parcelas" label="Adicionar parcelamento" />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Contas do mês</h2>
            <Link href="/contas-fixas" className="text-sm font-medium text-pine hover:underline">
              Ver todas
            </Link>
          </div>
          {snapshot.bills.length === 0 ? (
            <EmptyState
              title="Nenhuma conta fixa ainda"
              description="Cadastre aluguel, internet, academia e o restante das contas que se repetem todo mês."
            />
          ) : (
            <ul className="divide-y divide-line">
              {snapshot.bills.map((bill) => (
                <li key={bill.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{bill.name}</p>
                    <p className="text-xs text-muted">
                      Vence dia {bill.dueDay} · {bill.category.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <Money cents={bill.amountCents} className="block text-sm font-semibold" />
                    <StatusPill status={bill.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {pending.length > 0 ? (
            <p className="mt-4 text-sm text-muted">
              {pending.length} conta(s) ainda não marcada(s) como paga(s).
            </p>
          ) : snapshot.bills.length > 0 ? (
            <p className="mt-4 text-sm text-ok">Todas as contas deste mês estão pagas.</p>
          ) : null}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Movimento recente</h2>
            <Link href="/gastos" className="text-sm font-medium text-pine hover:underline">
              Gastos
            </Link>
          </div>
          {snapshot.incomes.length === 0 && snapshot.expenses.length === 0 ? (
            <EmptyState
              title="Sem lançamentos neste mês"
              description="Registre o salário, extras e os gastos não programados para o saldo ficar real."
            />
          ) : (
            <ul className="divide-y divide-line">
              {snapshot.incomes.slice(0, 4).map((item) => (
                <li key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-xs text-muted">Receita · {item.category.name}</p>
                  </div>
                  <Money cents={item.amountCents} className="text-sm font-semibold text-ok" />
                </li>
              ))}
              {snapshot.expenses.slice(0, 6).map((item) => (
                <li key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-xs text-muted">
                      {item.unplanned ? "Não programado" : "Gasto"} · {item.category.name}
                    </p>
                  </div>
                  <Money cents={item.amountCents} className="text-sm font-semibold text-rose" />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {snapshot.goals.length > 0 ? (
        <Card className="mt-4">
          <h2 className="font-display text-2xl">Metas</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {snapshot.goals.map((goal) => {
              const progress =
                goal.targetCents > 0
                  ? Math.min(goal.currentCents / goal.targetCents, 1)
                  : 0;
              return (
                <div key={goal.id} className="rounded-2xl border border-line p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{goal.name}</p>
                    <Money cents={goal.currentCents} className="text-sm" />
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Meta: <Money cents={goal.targetCents} />
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function formatHint(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function Stat({
  icon,
  label,
  cents,
  hint,
  signed = false,
}: {
  icon: ReactNode;
  label: string;
  cents: number;
  hint: string;
  signed?: boolean;
}) {
  return (
    <Card>
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-2xl bg-paper text-pine">
        {icon}
      </div>
      <p className="text-sm text-muted">{label}</p>
      <Money cents={cents} signed={signed} className="mt-1 block font-display text-3xl" />
      <p className="mt-2 text-xs text-muted">{hint}</p>
    </Card>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-line px-4 py-3 text-sm font-medium hover:border-pine hover:text-pine"
    >
      {label}
    </Link>
  );
}

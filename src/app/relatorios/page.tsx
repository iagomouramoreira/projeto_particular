import { MonthNav } from "@/components/MonthNav";
import { Card, EmptyState, Money, PageHeader } from "@/components/ui";
import { MONTH_NAMES, parseYearMonth } from "@/lib/dates";
import { getReport } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const { year, month } = parseYearMonth(await searchParams);
  const report = await getReport(year, month);
  const maxBar = Math.max(
    ...report.snapshots.flatMap((item) => [item.totals.receitas, item.totals.saidas]),
    1,
  );

  return (
    <div>
      <PageHeader
        eyebrow="Sugestão"
        title="Relatórios"
        description="Compare os últimos seis meses e veja onde o dinheiro está concentrado. Útil para cortar o que pesa sem perceber."
        action={<MonthNav year={year} month={month} pathname="/relatorios" />}
      />

      <Card>
        <h2 className="font-display text-2xl">Receitas x saídas</h2>
        <div className="mt-5 grid gap-4">
          {report.snapshots.map((item) => (
            <div key={`${item.year}-${item.month}`}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">
                  {MONTH_NAMES[item.month - 1].slice(0, 3)} {item.year}
                </span>
                <span className="text-muted">
                  saldo <Money cents={item.totals.saldo} signed />
                </span>
              </div>
              <div className="grid gap-1">
                <Bar color="bg-ok" width={(item.totals.receitas / maxBar) * 100} />
                <Bar color="bg-rose" width={(item.totals.saidas / maxBar) * 100} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">Verde: receitas. Vermelho: contas + gastos + parcelas.</p>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl">Saídas por categoria</h2>
          {report.categories.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Sem dados neste mês"
                description="Com contas, gastos e parcelas lançados, o relatório mostra o que mais pesa."
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {report.categories.map((category) => (
                <li key={category.name} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <Money cents={category.total} className="font-semibold" />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-2xl">Leitura do mês</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
            <li>
              Contas fixas comprometem{" "}
              <strong className="text-ink">
                {share(report.current.totals.fixas, report.current.totals.receitas)}
              </strong>{" "}
              da receita.
            </li>
            <li>
              Gastos não programados somam{" "}
              <Money cents={report.current.totals.gastos} className="font-semibold text-ink" />.
            </li>
            <li>
              Parcelas do mês:{" "}
              <Money cents={report.current.totals.parcelas} className="font-semibold text-ink" />.
            </li>
            <li>
              {report.current.totals.saldo >= 0
                ? "Houve sobra. Considere mandar parte para a reserva de emergência."
                : "O mês fechou negativo. Vale revisar gastos variáveis e parcelas novas."}
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Bar({ color, width }: { color: string; width: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-paper">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(width, 0)}%` }} />
    </div>
  );
}

function share(part: number, total: number): string {
  if (total <= 0) return "—";
  return `${Math.round((part / total) * 100)}%`;
}

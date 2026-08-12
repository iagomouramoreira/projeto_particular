import { ConfirmDeleteButton, SubmitButton } from "@/components/forms";
import { MonthNav } from "@/components/MonthNav";
import { Card, EmptyState, Field, Money, PageHeader } from "@/components/ui";
import { createIncome, deleteIncome } from "@/lib/actions";
import { formatISODate, parseYearMonth, todayISO } from "@/lib/dates";
import { getCategories, getMonthSnapshot } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ReceitasPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const { year, month } = parseYearMonth(await searchParams);
  const [categories, snapshot] = await Promise.all([
    getCategories("receita"),
    getMonthSnapshot(year, month),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Entradas"
        title="Receitas recebidas"
        description="Salário, freelance, reembolso, venda. Lance o que realmente entrou, não o que está previsto."
        action={<MonthNav year={year} month={month} pathname="/receitas" />}
      />

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <h2 className="font-display text-2xl">Nova receita</h2>
          <form action={createIncome} className="mt-4 grid gap-3">
            <Field label="Descrição">
              <input name="description" required placeholder="Salário" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Valor">
                <input name="amount" required placeholder="4.500,00" />
              </Field>
              <Field label="Data">
                <input name="date" type="date" required defaultValue={todayISO()} />
              </Field>
            </div>
            <Field label="Categoria">
              <select name="categoryId" required>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Origem">
              <input name="source" placeholder="Empresa, cliente, banco..." />
            </Field>
            <Field label="Observações">
              <textarea name="notes" rows={2} />
            </Field>
            <SubmitButton>Lançar receita</SubmitButton>
          </form>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Neste mês</h2>
            <Money cents={snapshot.totals.receitas} className="font-semibold text-ok" />
          </div>
          {snapshot.incomes.length === 0 ? (
            <EmptyState
              title="Nenhuma receita neste mês"
              description="Quando o pagamento cair, registre aqui. O saldo do dashboard só fica honesto com as entradas reais."
            />
          ) : (
            <ul className="divide-y divide-line">
              {snapshot.incomes.map((income) => (
                <li key={income.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{income.description}</p>
                    <p className="text-xs text-muted">
                      {formatISODate(income.date)} · {income.category.name}
                      {income.source ? ` · ${income.source}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <Money cents={income.amountCents} className="block font-semibold text-ok" />
                    <ConfirmDeleteButton action={deleteIncome} id={income.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

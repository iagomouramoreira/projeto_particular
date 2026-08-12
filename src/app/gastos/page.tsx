import { ConfirmDeleteButton, SubmitButton } from "@/components/forms";
import { MonthNav } from "@/components/MonthNav";
import { Card, EmptyState, Field, Money, PageHeader } from "@/components/ui";
import { createExpense, deleteExpense } from "@/lib/actions";
import { formatISODate, parseYearMonth, todayISO } from "@/lib/dates";
import { getCategories, getMonthSnapshot } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function GastosPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const { year, month } = parseYearMonth(await searchParams);
  const [categories, snapshot] = await Promise.all([
    getCategories("despesa"),
    getMonthSnapshot(year, month),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Variável"
        title="Gastos não programados"
        description="Farmácia, Uber, um jantar, um conserto. Tudo que não estava nas contas fixas entra aqui."
        action={<MonthNav year={year} month={month} pathname="/gastos" />}
      />

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <h2 className="font-display text-2xl">Novo gasto</h2>
          <form action={createExpense} className="mt-4 grid gap-3">
            <Field label="Descrição">
              <input name="description" required placeholder="Farmácia" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Valor">
                <input name="amount" required placeholder="47,90" />
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
            <Field label="Observações">
              <textarea name="notes" rows={2} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="unplanned" defaultChecked className="h-4 w-4" />
              Foi um gasto não programado
            </label>
            <SubmitButton>Registrar gasto</SubmitButton>
          </form>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Neste mês</h2>
            <Money cents={snapshot.totals.gastos} className="font-semibold text-rose" />
          </div>
          {snapshot.expenses.length === 0 ? (
            <EmptyState
              title="Nenhum gasto lançado"
              description="Quando sair um valor fora do planejado, registre na hora. O dashboard mostra o impacto no saldo."
            />
          ) : (
            <ul className="divide-y divide-line">
              {snapshot.expenses.map((expense) => (
                <li key={expense.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-xs text-muted">
                      {formatISODate(expense.date)} · {expense.category.name}
                      {expense.unplanned ? " · não programado" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <Money cents={expense.amountCents} className="block font-semibold" />
                    <ConfirmDeleteButton action={deleteExpense} id={expense.id} />
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

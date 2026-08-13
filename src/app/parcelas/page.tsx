import { ConfirmDeleteButton, SubmitButton } from "@/components/forms";
import { MonthNav } from "@/components/MonthNav";
import { Card, EmptyState, Field, Money, PageHeader } from "@/components/ui";
import {
  createInstallmentPlan,
  deleteInstallmentPlan,
  toggleInstallment,
} from "@/lib/actions";
import { MONTH_NAMES, parseYearMonth, todayISO } from "@/lib/dates";
import { getCategories, getInstallmentPlans, getMonthSnapshot } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ParcelasPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const { year, month } = parseYearMonth(await searchParams);
  const [categories, plans, snapshot] = await Promise.all([
    getCategories("despesa"),
    getInstallmentPlans(),
    getMonthSnapshot(year, month),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Sugestão"
        title="Parcelas e prestações"
        description="Celular, geladeira, curso, fatura parcelada no cartão. Cada parcela entra no mês correspondente e pesa no saldo."
        action={<MonthNav year={year} month={month} pathname="/parcelas" />}
      />

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <h2 className="font-display text-2xl">Novo parcelamento</h2>
          <form action={createInstallmentPlan} className="mt-4 grid gap-3">
            <Field label="Descrição">
              <input name="description" required placeholder="Notebook em 10x" />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Valor total">
                <input name="amount" required placeholder="3.000,00" />
              </Field>
              <Field label="Quantidade">
                <input name="count" type="number" min={1} max={48} required defaultValue={12} />
              </Field>
            </div>
            <Field label="Primeira parcela">
              <input name="startDate" type="date" required defaultValue={todayISO()} />
            </Field>
            <Field label="Categoria">
              <select name="categoryId" required defaultValue={categories.find((c) => c.name === "Parcelas")?.id}>
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
            <SubmitButton>Criar parcelas</SubmitButton>
          </form>
        </Card>

        <div className="grid gap-4">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-2xl">Neste mês</h2>
              <Money cents={snapshot.totals.parcelas} className="font-semibold" />
            </div>
            {snapshot.installments.length === 0 ? (
              <EmptyState
                title="Nenhuma parcela neste mês"
                description="Quando houver compra parcelada, o valor de cada mês aparece aqui e no resumo."
              />
            ) : (
              <ul className="divide-y divide-line">
                {snapshot.installments.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium">{item.plan.description}</p>
                      <p className="text-xs text-muted">
                        Parcela {item.number}/{item.plan.count}
                      </p>
                    </div>
                    <div className="text-right">
                      <Money cents={item.amountCents} className="block font-semibold" />
                      <form action={toggleInstallment}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          name="paid"
                          value={item.paidAt ? "false" : "true"}
                          className="text-xs font-medium text-pine hover:underline"
                        >
                          {item.paidAt ? "Desmarcar" : "Marcar paga"}
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="font-display text-2xl">Todos os planos</h2>
            {plans.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Nenhum parcelamento cadastrado.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {plans.map((plan) => {
                  const paid = plan.installments.filter((item) => item.paidAt).length;
                  return (
                    <li key={plan.id} className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{plan.description}</p>
                          <p className="text-xs text-muted">
                            {paid}/{plan.count} pagas · {MONTH_NAMES[plan.installments[0].month - 1]} a{" "}
                            {MONTH_NAMES[plan.installments[plan.installments.length - 1].month - 1]}
                          </p>
                        </div>
                        <div className="text-right">
                          <Money cents={plan.totalCents} className="block text-sm font-semibold" />
                          <ConfirmDeleteButton
                            action={deleteInstallmentPlan}
                            id={plan.id}
                            message="Excluir este parcelamento e todas as parcelas?"
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

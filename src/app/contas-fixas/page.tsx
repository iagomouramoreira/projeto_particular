import { ConfirmDeleteButton, SubmitButton } from "@/components/forms";
import { MonthNav } from "@/components/MonthNav";
import { Card, EmptyState, Field, Money, PageHeader, StatusPill } from "@/components/ui";
import {
  createFixedBill,
  deleteFixedBill,
  toggleBillPayment,
  updateFixedBill,
} from "@/lib/actions";
import { firstParam, parseYearMonth, todayISO } from "@/lib/dates";
import { getBillsForMonth, getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

const METHODS = ["Pix", "Boleto", "Débito automático", "Cartão", "Dinheiro"];

export default async function ContasFixasPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string; editar?: string }>;
}) {
  const params = await searchParams;
  const { year, month } = parseYearMonth(params);
  const editId = firstParam(params.editar);
  const [categories, bills] = await Promise.all([
    getCategories("despesa"),
    getBillsForMonth(year, month),
  ]);
  const editing = bills.find((bill) => bill.id === editId);

  return (
    <div>
      <PageHeader
        eyebrow="Mensal"
        title="Contas fixas"
        description="Aluguel, internet, academia, escola: tudo que se repete. Marque como paga a cada mês e acompanhe atrasos."
        action={<MonthNav year={year} month={month} pathname="/contas-fixas" />}
      />

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="font-display text-2xl">
            {editing ? "Editar conta" : "Nova conta fixa"}
          </h2>
          <form action={editing ? updateFixedBill : createFixedBill} className="mt-4 grid gap-3">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <Field label="Nome">
              <input name="name" required defaultValue={editing?.name ?? ""} placeholder="Internet" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Valor">
                <input
                  name="amount"
                  required
                  defaultValue={
                    editing ? (editing.amountCents / 100).toFixed(2).replace(".", ",") : ""
                  }
                  placeholder="120,00"
                />
              </Field>
              <Field label="Vence no dia">
                <input
                  name="dueDay"
                  type="number"
                  min={1}
                  max={31}
                  required
                  defaultValue={editing?.dueDay ?? 10}
                />
              </Field>
            </div>
            <Field label="Categoria">
              <select name="categoryId" required defaultValue={editing?.categoryId}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Forma de pagamento">
              <select name="paymentMethod" defaultValue={editing?.paymentMethod ?? ""}>
                <option value="">Não informado</option>
                {METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Observações">
              <textarea name="notes" rows={2} defaultValue={editing?.notes ?? ""} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                name="variableAmount"
                defaultChecked={editing?.variableAmount}
                className="h-4 w-4"
              />
              Valor pode variar (água, luz, cartão)
            </label>
            {editing ? (
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={editing.active}
                  className="h-4 w-4"
                />
                Conta ativa
              </label>
            ) : null}
            <SubmitButton>{editing ? "Salvar alterações" : "Cadastrar conta"}</SubmitButton>
          </form>
        </Card>

        <Card>
          <h2 className="font-display text-2xl">Deste mês</h2>
          {bills.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Cadastre a primeira conta"
                description="Comece pelas que não mudam: aluguel, condomínio, internet, streaming e plano de saúde."
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {bills.map((bill) => (
                <li key={bill.id} className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{bill.name}</p>
                      <p className="text-xs text-muted">
                        Dia {bill.dueDay} · {bill.category.name}
                        {bill.paymentMethod ? ` · ${bill.paymentMethod}` : ""}
                        {bill.variableAmount ? " · valor variável" : ""}
                        {bill.active ? "" : " · inativa"}
                      </p>
                    </div>
                    <div className="text-right">
                      <Money cents={bill.amountCents} className="block font-semibold" />
                      <StatusPill status={bill.status} />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <form action={toggleBillPayment} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="fixedBillId" value={bill.id} />
                      <input type="hidden" name="year" value={year} />
                      <input type="hidden" name="month" value={month} />
                      {bill.status === "pago" ? (
                        <button
                          type="submit"
                          name="paid"
                          value="false"
                          className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold"
                        >
                          Desmarcar pagamento
                        </button>
                      ) : (
                        <>
                          <input
                            name="amount"
                            className="w-28 py-1.5 text-sm"
                            defaultValue={(bill.amountCents / 100).toFixed(2).replace(".", ",")}
                            aria-label="Valor pago"
                          />
                          <button
                            type="submit"
                            name="paid"
                            value="true"
                            className="rounded-full bg-pine px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            Marcar como paga
                          </button>
                        </>
                      )}
                    </form>
                    <a
                      href={`/contas-fixas?ano=${year}&mes=${month}&editar=${bill.id}`}
                      className="text-xs font-medium text-pine hover:underline"
                    >
                      Editar
                    </a>
                    <ConfirmDeleteButton
                      action={deleteFixedBill}
                      id={bill.id}
                      message="Excluir esta conta fixa e o histórico de pagamentos?"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted">
            Hoje é {todayISO().split("-").reverse().join("/")}. Contas com vencimento anterior e sem pagamento aparecem como atrasadas.
          </p>
        </Card>
      </div>
    </div>
  );
}

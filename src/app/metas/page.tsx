import { ConfirmDeleteButton, SubmitButton } from "@/components/forms";
import { Card, EmptyState, Field, Money, PageHeader } from "@/components/ui";
import { contributeToGoal, createGoal, deleteGoal } from "@/lib/actions";
import { formatISODate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/ensure-seed";

export const dynamic = "force-dynamic";

export default async function MetasPage() {
  await ensureSeeded();
  const goals = await prisma.savingsGoal.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Sugestão"
        title="Metas e reserva"
        description="Guarde um valor para emergência, viagem ou um bem. Cada aporte aparece no progresso da meta."
      />

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <h2 className="font-display text-2xl">Nova meta</h2>
          <form action={createGoal} className="mt-4 grid gap-3">
            <Field label="Nome">
              <input name="name" required placeholder="Reserva de emergência" />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Objetivo">
                <input name="target" required placeholder="10.000,00" />
              </Field>
              <Field label="Já guardado">
                <input name="current" placeholder="0,00" />
              </Field>
            </div>
            <Field label="Prazo (opcional)">
              <input name="deadline" type="date" />
            </Field>
            <Field label="Observações">
              <textarea name="notes" rows={2} placeholder="3 a 6 meses de contas fixas é um bom começo." />
            </Field>
            <SubmitButton>Criar meta</SubmitButton>
          </form>
        </Card>

        <Card>
          <h2 className="font-display text-2xl">Em andamento</h2>
          {goals.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Nenhuma meta ainda"
                description="Uma reserva de emergência equivalente a alguns meses de contas fixas evita que um imprevisto vire dívida."
              />
            </div>
          ) : (
            <ul className="mt-4 grid gap-4">
              {goals.map((goal) => {
                const progress =
                  goal.targetCents > 0
                    ? Math.min(goal.currentCents / goal.targetCents, 1)
                    : 0;
                return (
                  <li key={goal.id} className="rounded-2xl border border-line p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{goal.name}</p>
                        <p className="text-xs text-muted">
                          {goal.deadline ? `Até ${formatISODate(goal.deadline)}` : "Sem prazo"}
                        </p>
                      </div>
                      <ConfirmDeleteButton action={deleteGoal} id={goal.id} />
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${Math.round(progress * 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      <Money cents={goal.currentCents} /> de{" "}
                      <Money cents={goal.targetCents} /> ({Math.round(progress * 100)}%)
                    </p>
                    <form action={contributeToGoal} className="mt-3 flex gap-2">
                      <input type="hidden" name="id" value={goal.id} />
                      <input name="amount" required placeholder="200,00" className="flex-1" />
                      <SubmitButton>Guardar</SubmitButton>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

import assert from "node:assert/strict";
import test from "node:test";
import { dueDateInMonth } from "./dates";
import {
  billStatus,
  computeMonthSummary,
  spendingRatio,
  splitInstallments,
} from "./summary";

test("resume o mês com receitas, contas, gastos e parcelas", () => {
  const summary = computeMonthSummary({
    receitasCents: [500000],
    contasFixasCents: [180000, 20000],
    gastosCents: [45000],
    parcelasCents: [15000],
  });

  assert.equal(summary.receitas, 500000);
  assert.equal(summary.fixas, 200000);
  assert.equal(summary.gastos, 45000);
  assert.equal(summary.parcelas, 15000);
  assert.equal(summary.saidas, 260000);
  assert.equal(summary.saldo, 240000);
  assert.equal(summary.livreAposFixas, 300000);
});

test("ajusta vencimento para o último dia do mês", () => {
  assert.equal(dueDateInMonth(2026, 2, 31), "2026-02-28");
  assert.equal(dueDateInMonth(2026, 1, 31), "2026-01-31");
});

test("classifica status da conta fixa", () => {
  assert.equal(billStatus({ paid: true, dueDate: "2026-08-10", today: "2026-08-12" }), "pago");
  assert.equal(billStatus({ paid: false, dueDate: "2026-08-10", today: "2026-08-12" }), "atrasado");
  assert.equal(billStatus({ paid: false, dueDate: "2026-08-20", today: "2026-08-12" }), "pendente");
});

test("divide parcelas deixando o resto na última", () => {
  assert.deepEqual(splitInstallments(10000, 3), [3333, 3333, 3334]);
  assert.deepEqual(splitInstallments(9000, 3), [3000, 3000, 3000]);
});

test("calcula proporção de gastos sem passar de 100%", () => {
  assert.equal(spendingRatio(100, 40), 0.4);
  assert.equal(spendingRatio(100, 180), 1);
  assert.equal(spendingRatio(0, 10), 1);
  assert.equal(spendingRatio(0, 0), 0);
});

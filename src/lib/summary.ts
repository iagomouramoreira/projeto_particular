export type MonthTotals = {
  receitas: number;
  fixas: number;
  gastos: number;
  parcelas: number;
  saidas: number;
  saldo: number;
  livreAposFixas: number;
};

export function sumCents(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function computeMonthSummary(input: {
  receitasCents: number[];
  contasFixasCents: number[];
  gastosCents: number[];
  parcelasCents: number[];
}): MonthTotals {
  const receitas = sumCents(input.receitasCents);
  const fixas = sumCents(input.contasFixasCents);
  const gastos = sumCents(input.gastosCents);
  const parcelas = sumCents(input.parcelasCents);
  const saidas = fixas + gastos + parcelas;
  return {
    receitas,
    fixas,
    gastos,
    parcelas,
    saidas,
    saldo: receitas - saidas,
    livreAposFixas: receitas - fixas,
  };
}

export function spendingRatio(receitas: number, saidas: number): number {
  if (receitas <= 0) return saidas > 0 ? 1 : 0;
  return Math.min(saidas / receitas, 1);
}

export type BillStatus = "pago" | "pendente" | "atrasado";

export function billStatus(input: {
  paid: boolean;
  dueDate: string;
  today: string;
}): BillStatus {
  if (input.paid) return "pago";
  if (input.today > input.dueDate) return "atrasado";
  return "pendente";
}

export function splitInstallments(totalCents: number, count: number): number[] {
  if (count < 1) {
    throw new Error("A quantidade de parcelas precisa ser pelo menos 1.");
  }
  if (totalCents < 0) {
    throw new Error("O valor total não pode ser negativo.");
  }

  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from({ length: count }, (_, index) =>
    index === count - 1 ? base + remainder : base,
  );
}

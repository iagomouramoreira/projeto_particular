import { dueDateInMonth, monthRange, todayISO } from "./dates";
import { ensureSeeded } from "./ensure-seed";
import { prisma } from "./prisma";
import { billStatus, computeMonthSummary } from "./summary";

export async function getCategories(kind?: "receita" | "despesa") {
  await ensureSeeded();
  return prisma.category.findMany({
    where: kind ? { kind } : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getMonthSnapshot(year: number, month: number) {
  await ensureSeeded();
  const { start, end } = monthRange(year, month);
  const today = todayISO();

  const [bills, expenses, incomes, installments, goals] = await Promise.all([
    prisma.fixedBill.findMany({
      where: { active: true },
      include: {
        category: true,
        payments: { where: { year, month } },
      },
      orderBy: [{ dueDay: "asc" }, { name: "asc" }],
    }),
    prisma.expense.findMany({
      where: { date: { gte: start, lt: end } },
      include: { category: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.income.findMany({
      where: { date: { gte: start, lt: end } },
      include: { category: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.installment.findMany({
      where: { year, month },
      include: { plan: { include: { category: true } } },
      orderBy: { number: "asc" },
    }),
    prisma.savingsGoal.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const billViews = bills.map((bill) => {
    const payment = bill.payments[0];
    const dueDate = dueDateInMonth(year, month, bill.dueDay);
    const amountCents = payment?.amountCents ?? bill.amountCents;
    const status = billStatus({
      paid: Boolean(payment?.paidAt),
      dueDate,
      today,
    });
    return {
      ...bill,
      payment,
      dueDate,
      amountCents,
      status,
    };
  });

  const totals = computeMonthSummary({
    receitasCents: incomes.map((item) => item.amountCents),
    contasFixasCents: billViews.map((item) => item.amountCents),
    gastosCents: expenses.map((item) => item.amountCents),
    parcelasCents: installments.map((item) => item.amountCents),
  });

  return {
    bills: billViews,
    expenses,
    incomes,
    installments,
    goals,
    totals,
  };
}

export async function getBillsForMonth(year: number, month: number) {
  await ensureSeeded();
  const today = todayISO();
  const bills = await prisma.fixedBill.findMany({
    include: {
      category: true,
      payments: { where: { year, month } },
    },
    orderBy: [{ active: "desc" }, { dueDay: "asc" }, { name: "asc" }],
  });

  return bills.map((bill) => {
    const payment = bill.payments[0];
    const dueDate = dueDateInMonth(year, month, bill.dueDay);
    return {
      ...bill,
      payment,
      dueDate,
      amountCents: payment?.amountCents ?? bill.amountCents,
      status: billStatus({
        paid: Boolean(payment?.paidAt),
        dueDate,
        today,
      }),
    };
  });
}

export async function getInstallmentPlans() {
  await ensureSeeded();
  return prisma.installmentPlan.findMany({
    include: {
      category: true,
      installments: { orderBy: { number: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReport(year: number, month: number) {
  const months = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(year, month - 1 - offset, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  }

  const snapshots = [];
  for (const item of months) {
    snapshots.push({
      ...item,
      ...(await getMonthSnapshot(item.year, item.month)),
    });
  }

  const current = snapshots[snapshots.length - 1];
  const expenseByCategory = new Map<string, { name: string; color: string; total: number }>();

  for (const bill of current.bills) {
    const key = bill.category.name;
    const currentValue = expenseByCategory.get(key) ?? {
      name: bill.category.name,
      color: bill.category.color,
      total: 0,
    };
    currentValue.total += bill.amountCents;
    expenseByCategory.set(key, currentValue);
  }

  for (const expense of current.expenses) {
    const key = expense.category.name;
    const currentValue = expenseByCategory.get(key) ?? {
      name: expense.category.name,
      color: expense.category.color,
      total: 0,
    };
    currentValue.total += expense.amountCents;
    expenseByCategory.set(key, currentValue);
  }

  for (const installment of current.installments) {
    const key = installment.plan.category.name;
    const currentValue = expenseByCategory.get(key) ?? {
      name: installment.plan.category.name,
      color: installment.plan.category.color,
      total: 0,
    };
    currentValue.total += installment.amountCents;
    expenseByCategory.set(key, currentValue);
  }

  return {
    snapshots,
    current,
    categories: [...expenseByCategory.values()].sort((a, b) => b.total - a.total),
  };
}

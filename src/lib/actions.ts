"use server";

import { revalidatePath } from "next/cache";
import { parseISODate } from "./dates";
import { parseMoneyToCents } from "./money";
import { prisma } from "./prisma";
import { splitInstallments } from "./summary";

function required(formData: FormData, key: string): string {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) {
    throw new Error(`Campo obrigatório: ${key}`);
  }
  return value;
}

function optional(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function checkbox(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function createFixedBill(formData: FormData) {
  const dueDay = Number(required(formData, "dueDay"));
  if (dueDay < 1 || dueDay > 31) {
    throw new Error("O dia de vencimento precisa estar entre 1 e 31.");
  }

  await prisma.fixedBill.create({
    data: {
      name: required(formData, "name"),
      amountCents: parseMoneyToCents(required(formData, "amount")),
      dueDay,
      variableAmount: checkbox(formData, "variableAmount"),
      paymentMethod: optional(formData, "paymentMethod"),
      notes: optional(formData, "notes"),
      categoryId: required(formData, "categoryId"),
      active: true,
    },
  });
  refresh();
}

export async function updateFixedBill(formData: FormData) {
  const dueDay = Number(required(formData, "dueDay"));
  await prisma.fixedBill.update({
    where: { id: required(formData, "id") },
    data: {
      name: required(formData, "name"),
      amountCents: parseMoneyToCents(required(formData, "amount")),
      dueDay,
      variableAmount: checkbox(formData, "variableAmount"),
      paymentMethod: optional(formData, "paymentMethod"),
      notes: optional(formData, "notes"),
      categoryId: required(formData, "categoryId"),
      active: checkbox(formData, "active"),
    },
  });
  refresh();
}

export async function deleteFixedBill(formData: FormData) {
  await prisma.fixedBill.delete({ where: { id: required(formData, "id") } });
  refresh();
}

export async function toggleBillPayment(formData: FormData) {
  const fixedBillId = required(formData, "fixedBillId");
  const year = Number(required(formData, "year"));
  const month = Number(required(formData, "month"));
  const paid = checkbox(formData, "paid");
  const amountRaw = optional(formData, "amount");

  const bill = await prisma.fixedBill.findUniqueOrThrow({
    where: { id: fixedBillId },
  });
  const amountCents = amountRaw
    ? parseMoneyToCents(amountRaw)
    : bill.amountCents;

  await prisma.billPayment.upsert({
    where: {
      fixedBillId_year_month: { fixedBillId, year, month },
    },
    update: {
      amountCents,
      paidAt: paid ? new Date() : null,
    },
    create: {
      fixedBillId,
      year,
      month,
      amountCents,
      paidAt: paid ? new Date() : null,
    },
  });
  refresh();
}

export async function createExpense(formData: FormData) {
  await prisma.expense.create({
    data: {
      description: required(formData, "description"),
      amountCents: parseMoneyToCents(required(formData, "amount")),
      date: required(formData, "date"),
      unplanned: checkbox(formData, "unplanned"),
      notes: optional(formData, "notes"),
      categoryId: required(formData, "categoryId"),
    },
  });
  refresh();
}

export async function deleteExpense(formData: FormData) {
  await prisma.expense.delete({ where: { id: required(formData, "id") } });
  refresh();
}

export async function createIncome(formData: FormData) {
  await prisma.income.create({
    data: {
      description: required(formData, "description"),
      amountCents: parseMoneyToCents(required(formData, "amount")),
      date: required(formData, "date"),
      source: optional(formData, "source"),
      notes: optional(formData, "notes"),
      categoryId: required(formData, "categoryId"),
    },
  });
  refresh();
}

export async function deleteIncome(formData: FormData) {
  await prisma.income.delete({ where: { id: required(formData, "id") } });
  refresh();
}

export async function createInstallmentPlan(formData: FormData) {
  const totalCents = parseMoneyToCents(required(formData, "amount"));
  const count = Number(required(formData, "count"));
  const startDate = parseISODate(required(formData, "startDate"));
  const amounts = splitInstallments(totalCents, count);

  await prisma.installmentPlan.create({
    data: {
      description: required(formData, "description"),
      totalCents,
      count,
      notes: optional(formData, "notes"),
      categoryId: required(formData, "categoryId"),
      installments: {
        create: amounts.map((amountCents, index) => {
          const due = new Date(startDate.year, startDate.month - 1 + index, 1);
          return {
            number: index + 1,
            amountCents,
            year: due.getFullYear(),
            month: due.getMonth() + 1,
          };
        }),
      },
    },
  });
  refresh();
}

export async function toggleInstallment(formData: FormData) {
  const id = required(formData, "id");
  const paid = checkbox(formData, "paid");
  await prisma.installment.update({
    where: { id },
    data: { paidAt: paid ? new Date() : null },
  });
  refresh();
}

export async function deleteInstallmentPlan(formData: FormData) {
  await prisma.installmentPlan.delete({
    where: { id: required(formData, "id") },
  });
  refresh();
}

export async function createGoal(formData: FormData) {
  await prisma.savingsGoal.create({
    data: {
      name: required(formData, "name"),
      targetCents: parseMoneyToCents(required(formData, "target")),
      currentCents: optional(formData, "current")
        ? parseMoneyToCents(String(formData.get("current")))
        : 0,
      deadline: optional(formData, "deadline"),
      notes: optional(formData, "notes"),
    },
  });
  refresh();
}

export async function contributeToGoal(formData: FormData) {
  const id = required(formData, "id");
  const amount = parseMoneyToCents(required(formData, "amount"));
  await prisma.savingsGoal.update({
    where: { id },
    data: { currentCents: { increment: amount } },
  });
  refresh();
}

export async function deleteGoal(formData: FormData) {
  await prisma.savingsGoal.delete({ where: { id: required(formData, "id") } });
  refresh();
}

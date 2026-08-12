import { PrismaClient } from "@prisma/client";

export const DEFAULT_CATEGORIES = [
  { name: "Salário", kind: "receita", color: "#1f5c4d" },
  { name: "Freelance", kind: "receita", color: "#2d6a4f" },
  { name: "Extra", kind: "receita", color: "#3b7d63" },
  { name: "Rendimentos", kind: "receita", color: "#b0893e" },
  { name: "Moradia", kind: "despesa", color: "#6b4f3a" },
  { name: "Contas da casa", kind: "despesa", color: "#8a6a4a" },
  { name: "Internet e telefone", kind: "despesa", color: "#4a6b8a" },
  { name: "Alimentação", kind: "despesa", color: "#9b3a3a" },
  { name: "Transporte", kind: "despesa", color: "#3d5a80" },
  { name: "Saúde", kind: "despesa", color: "#2a6f6a" },
  { name: "Educação", kind: "despesa", color: "#4c5c7a" },
  { name: "Assinaturas", kind: "despesa", color: "#6a4c7a" },
  { name: "Lazer", kind: "despesa", color: "#b45309" },
  { name: "Parcelas", kind: "despesa", color: "#7a4c4c" },
  { name: "Outros", kind: "despesa", color: "#6f675d" },
] as const;

export async function seedCategories(client: PrismaClient) {
  const count = await client.category.count();
  if (count > 0) return;

  await client.category.createMany({
    data: DEFAULT_CATEGORIES.map((category) => ({ ...category })),
  });
}

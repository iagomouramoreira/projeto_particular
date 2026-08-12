import { seedCategories } from "./categories";
import { prisma } from "./prisma";

let seeded = false;

export async function ensureSeeded() {
  if (seeded) return;
  await seedCategories(prisma);
  seeded = true;
}

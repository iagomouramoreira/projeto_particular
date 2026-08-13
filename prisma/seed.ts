import { PrismaClient } from "@prisma/client";
import { seedCategories } from "../src/lib/categories";

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedCategories(prisma);
    console.log("Categorias iniciais prontas.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

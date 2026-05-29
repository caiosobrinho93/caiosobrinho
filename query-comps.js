const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const comps = await prisma.devComponent.findMany({ where: { title: 'button-menu' }, orderBy: { createdAt: 'desc' } });
  console.log(JSON.stringify(comps, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";

// Obter a URL do banco de dados do ambiente
let databaseUrl = process.env.DATABASE_URL || "";

// Se a URL estiver definida e não contiver os parâmetros de pooler, adiciona para evitar conflitos de Prepared Statements no PgBouncer/Supavisor
if (databaseUrl && !databaseUrl.includes("pgbouncer=") && !databaseUrl.includes("statement_cache_size=")) {
  const separator = databaseUrl.includes("?") ? "&" : "?";
  databaseUrl = `${databaseUrl}${separator}pgbouncer=true&statement_cache_size=0`;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl || undefined,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

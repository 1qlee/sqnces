import { PrismaClient } from "@prisma/client";
import prismaRandom from 'prisma-extension-random';

import { env } from "~/env";

const createPrismaClient = () =>
  new PrismaClient().$extends(prismaRandom());

// {
//   log:
//   env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
//   }

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

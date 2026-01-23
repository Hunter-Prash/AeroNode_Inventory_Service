import { PrismaClient } from "@prisma/client";

// shared singleton client
export const prisma = new PrismaClient();

// export PrismaClient + all generated enums/types/models
export { PrismaClient };
export * from "@prisma/client";